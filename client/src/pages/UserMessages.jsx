import { useCallback, useEffect, useRef, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { FaComments, FaPaperPlane, FaPaw } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function parseApiResponse(response) {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

function formatTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleString();
}

export default function UserMessages() {
    const { user, token, loading } = useAuth();
    const { error, success } = useNotification();
    const [searchParams, setSearchParams] = useSearchParams();

    const [threads, setThreads] = useState([]);
    const [threadsLoading, setThreadsLoading] = useState(true);
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const listRef = useRef(null);

    const fetchThreads = useCallback(async (showLoading = false) => {
        if (!token) return;

        if (showLoading) setThreadsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/messages/direct/threads`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await parseApiResponse(response);

            if (!data) {
                throw new Error('Server returned non-JSON data. Check backend URL and API server status.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load chats');
            }

            const nextThreads = Array.isArray(data) ? data : [];
            setThreads(nextThreads);

            if (nextThreads.length === 0) {
                setSelectedThreadId(null);
                setActiveThread(null);
                setMessages([]);
            } else if (!selectedThreadId || !nextThreads.some((item) => item.threadId === selectedThreadId)) {
                setSelectedThreadId(nextThreads[0].threadId);
            }
        } catch (err) {
            error(err.message || 'Failed to load chats');
        } finally {
            if (showLoading) setThreadsLoading(false);
        }
    }, [token, selectedThreadId, error]);

    const fetchThreadDetail = useCallback(async (threadId, showLoading = false) => {
        if (!token || !threadId) return;

        if (showLoading) setMessagesLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/messages/direct/threads/${threadId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await parseApiResponse(response);

            if (!data) {
                throw new Error('Server returned non-JSON data. Check backend URL and API server status.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load messages');
            }

            setActiveThread(data.thread || null);
            setMessages(Array.isArray(data.messages) ? data.messages : []);
        } catch (err) {
            error(err.message || 'Failed to load messages');
        } finally {
            if (showLoading) setMessagesLoading(false);
        }
    }, [token, error]);

    const startThreadFromPet = useCallback(async () => {
        const petIdParam = searchParams.get('petId');
        if (!petIdParam || !token || !user || user.role === 'admin') return;

        const petId = Number(petIdParam);
        if (!Number.isInteger(petId) || petId <= 0) {
            error('Invalid pet id in chat request');
            setSearchParams({}, { replace: true });
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/messages/direct/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ petId }),
            });
            const data = await parseApiResponse(response);

            if (!data) {
                throw new Error('Server returned non-JSON data. Check backend URL and API server status.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to start chat with owner');
            }

            if (data.threadId) {
                setSelectedThreadId(data.threadId);
            }

            await fetchThreads(false);
        } catch (err) {
            error(err.message || 'Failed to start chat with owner');
        } finally {
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, token, user, error, fetchThreads, setSearchParams]);

    useEffect(() => {
        if (!token || !user || user.role === 'admin') return;

        fetchThreads(true);
        const interval = setInterval(() => fetchThreads(false), 7000);
        return () => clearInterval(interval);
    }, [token, user, fetchThreads]);

    useEffect(() => {
        if (!token || !selectedThreadId) return;

        fetchThreadDetail(selectedThreadId, true);
        const interval = setInterval(() => fetchThreadDetail(selectedThreadId, false), 5000);
        return () => clearInterval(interval);
    }, [token, selectedThreadId, fetchThreadDetail]);

    useEffect(() => {
        if (!token || !user || user.role === 'admin') return;
        startThreadFromPet();
    }, [token, user, startThreadFromPet]);

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    const handleSend = async (event) => {
        event.preventDefault();
        const message = draft.trim();

        if (!message || !selectedThreadId || sending || !token) return;

        try {
            setSending(true);
            const response = await fetch(`${API_BASE_URL}/api/messages/direct/threads/${selectedThreadId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message }),
            });
            const data = await parseApiResponse(response);

            if (!data) {
                throw new Error('Server returned non-JSON data. Check backend URL and API server status.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send message');
            }

            setDraft('');
            success('Message sent');
            await fetchThreadDetail(selectedThreadId, false);
            await fetchThreads(false);
        } catch (err) {
            error(err.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/messages" replace />;

    return (
        <div className="min-h-screen bg-warm-bg">
            <Navbar />

            <main className="max-w-[1320px] mx-auto px-6 py-10 md:py-12">
                <div className="mb-6">
                    <span className="section-label">Direct Chat</span>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-warm-text mb-2">Chat With Pet Owners</h1>
                    <p className="text-warm-muted text-sm md:text-base">Ask questions and discuss pets directly with the listing owner.</p>
                </div>

                <section className="bg-white border border-warm-border/60 rounded-3xl shadow-warm-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] min-h-[680px]">
                        <aside className="border-r border-warm-border/60 bg-[#FFFEF9]">
                            <div className="px-4 py-4 border-b border-warm-border/60 flex items-center justify-between">
                                <h2 className="font-semibold text-warm-text">Conversations</h2>
                                <button
                                    onClick={() => fetchThreads(true)}
                                    className="text-xs px-3 py-1.5 rounded-full border border-warm-border text-warm-muted hover:text-warm-text hover:bg-white transition"
                                    type="button"
                                >
                                    Refresh
                                </button>
                            </div>

                            <div className="max-h-[620px] overflow-y-auto">
                                {threadsLoading ? (
                                    <div className="px-4 py-10 text-sm text-center text-warm-muted">Loading chats...</div>
                                ) : threads.length === 0 ? (
                                    <div className="px-4 py-10 text-center text-warm-muted text-sm">No chats yet. Open a pet and click Chat with Owner.</div>
                                ) : (
                                    <ul className="divide-y divide-warm-border/50">
                                        {threads.map((thread) => (
                                            <li key={thread.threadId}>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedThreadId(thread.threadId)}
                                                    className={`w-full text-left px-4 py-3.5 hover:bg-primary-50/60 transition ${
                                                        selectedThreadId === thread.threadId ? 'bg-primary-50 border-l-4 border-primary-500 pl-3' : ''
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <p className="font-semibold text-sm text-warm-text truncate">{thread.otherUserName}</p>
                                                        {Number(thread.unreadCount) > 0 && (
                                                            <span className="text-2xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">{thread.unreadCount}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-2xs text-warm-faded mb-1 capitalize">{thread.otherUserRole} • {thread.petName}</p>
                                                    <p className="text-xs text-warm-muted truncate">{thread.lastMessage || 'No messages yet'}</p>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </aside>

                        <div className="flex flex-col min-h-[680px]">
                            {!selectedThreadId ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
                                        <FaComments size={24} />
                                    </div>
                                    <h2 className="font-heading text-2xl text-warm-text mb-2">No conversation selected</h2>
                                    <p className="text-sm text-warm-muted">Select a conversation from the left panel.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="px-5 py-4 border-b border-warm-border/60 bg-primary-50/40 flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-warm-text">{activeThread?.ownerUserId === Number(user.id) ? activeThread?.participantName : activeThread?.ownerName}</h3>
                                            <p className="text-xs text-warm-faded">Pet: {activeThread?.petName || '-'}</p>
                                        </div>
                                        <div className="inline-flex items-center gap-2 text-xs text-primary-800 bg-primary-100 border border-primary-200 rounded-full px-2.5 py-1">
                                            <FaPaw className="text-[0.6rem]" />
                                            {activeThread?.petBreed || 'Pet Chat'}
                                        </div>
                                    </div>

                                    {messagesLoading ? (
                                        <div className="flex-1 flex items-center justify-center text-warm-muted text-sm">Loading conversation...</div>
                                    ) : (
                                        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-5 bg-gradient-to-b from-white to-[#FFF9EC]">
                                            {messages.length === 0 ? (
                                                <div className="h-full flex items-center justify-center text-sm text-warm-muted">No messages yet. Say hello.</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {messages.map((item) => {
                                                        const isOwn = Number(item.senderUserId) === Number(user.id);
                                                        return (
                                                            <div key={item.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                                <div
                                                                    className={`max-w-[82%] rounded-2xl px-4 py-3 border shadow-sm ${
                                                                        isOwn
                                                                            ? 'bg-primary-600 text-white border-primary-700 rounded-br-md'
                                                                            : 'bg-white text-warm-text border-warm-border rounded-bl-md'
                                                                    }`}
                                                                >
                                                                    <p className="text-sm whitespace-pre-wrap break-words">{item.message}</p>
                                                                    <p className={`text-2xs mt-2 ${isOwn ? 'text-primary-100' : 'text-warm-faded'}`}>
                                                                        {isOwn ? 'You' : item.senderName} • {formatTime(item.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <form onSubmit={handleSend} className="p-4 border-t border-warm-border/60 bg-white">
                                        <div className="flex items-end gap-3">
                                            <textarea
                                                value={draft}
                                                onChange={(event) => setDraft(event.target.value)}
                                                placeholder="Type your message..."
                                                rows={2}
                                                maxLength={2000}
                                                className="flex-1 resize-none rounded-2xl border border-warm-border bg-[#FFFEFA] px-4 py-3 text-sm text-warm-text placeholder:text-warm-faded focus:outline-none focus:ring-2 focus:ring-primary-300"
                                            />
                                            <button
                                                type="submit"
                                                disabled={sending || !draft.trim()}
                                                className="btn-primary px-5 py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <FaPaperPlane />
                                                {sending ? 'Sending...' : 'Send'}
                                            </button>
                                        </div>
                                        <p className="text-2xs text-warm-faded mt-2 text-right">{draft.length}/2000</p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
