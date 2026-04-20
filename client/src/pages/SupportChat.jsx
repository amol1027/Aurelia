import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { FaHeadset, FaPaperPlane, FaUserShield } from 'react-icons/fa';
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

export default function SupportChat() {
    const { user, token, loading } = useAuth();
    const { error, success } = useNotification();
    const [threadId, setThreadId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [adminOnline, setAdminOnline] = useState(false);
    const [adminTyping, setAdminTyping] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [draft, setDraft] = useState('');
    const listRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastTypingSentRef = useRef(false);

    const fetchMessages = useCallback(async (showLoading = false) => {
        if (!token) return;

        if (showLoading) setPageLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/messages/me`, {
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

            setThreadId(data.threadId || null);
            setMessages(Array.isArray(data.messages) ? data.messages : []);
            setAdminOnline(Boolean(data?.presence?.adminOnline));
            setAdminTyping(Boolean(data?.presence?.adminTyping));
        } catch (err) {
            error(err.message || 'Failed to load messages');
        } finally {
            if (showLoading) setPageLoading(false);
        }
    }, [token, error]);

    const sendTypingStatus = useCallback(async (isTyping) => {
        if (!token) return;
        if (lastTypingSentRef.current === isTyping) return;

        try {
            lastTypingSentRef.current = isTyping;
            await fetch(`${API_BASE_URL}/api/messages/me/typing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ threadId, isTyping }),
            });
        } catch {
            // Typing indicators are best effort and should never block chat usage.
        }
    }, [token, threadId]);

    useEffect(() => {
        if (!token || !user || user.role === 'admin') return;

        fetchMessages(true);
        const interval = setInterval(() => {
            fetchMessages(false);
        }, 3000);

        return () => clearInterval(interval);
    }, [token, user, fetchMessages]);

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (!token || !user || user.role === 'admin') return;

        const hasText = Boolean(draft.trim());

        if (!hasText) {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
            sendTypingStatus(false);
            return;
        }

        sendTypingStatus(true);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            sendTypingStatus(false);
            typingTimeoutRef.current = null;
        }, 1500);
    }, [draft, token, user, sendTypingStatus]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleSend = async (event) => {
        event.preventDefault();
        const message = draft.trim();

        if (!message || !token || sending) return;

        try {
            setSending(true);
            const response = await fetch(`${API_BASE_URL}/api/messages/me`, {
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
            await sendTypingStatus(false);
            success('Message sent to admin');
            await fetchMessages(false);
        } catch (err) {
            error(err.message || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const title = useMemo(() => {
        if (!user) return 'Support Chat';
        return user.role === 'shelter' ? 'Shelter Support Chat' : 'Adopter Support Chat';
    }, [user]);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role === 'admin') return <Navigate to="/admin/messages" replace />;

    const threadItems = [
        {
            threadId: threadId || 'new',
            title: 'Administrator',
            subtitle: user?.role === 'shelter' ? 'Shelter support channel' : 'Adopter support channel',
            lastMessage: messages.length > 0 ? messages[messages.length - 1]?.message : 'No messages yet',
            lastMessageAt: messages.length > 0 ? messages[messages.length - 1]?.createdAt : null,
            unreadCount: messages.filter((item) => Number(item.senderUserId) !== Number(user?.id) && !item.isRead).length,
        },
    ];

    return (
        <div className="min-h-screen bg-warm-bg">
            <Navbar />

            <main className="max-w-[1320px] mx-auto px-6 py-10 md:py-12">
                <div className="mb-6">
                    <span className="section-label">Contact Admin</span>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-warm-text mb-2">{title}</h1>
                    <p className="text-warm-muted text-sm md:text-base">Ask questions about adoption flow, account access, policies, or platform support.</p>
                </div>

                <section className="bg-white border border-warm-border/60 rounded-3xl shadow-warm-sm overflow-hidden">
                    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] min-h-[680px]">
                        <aside className="border-r border-warm-border/60 bg-[#FFFEF9]">
                            <div className="px-4 py-4 border-b border-warm-border/60 flex items-center justify-between">
                                <h2 className="font-semibold text-warm-text">Support Channels</h2>
                                <button
                                    onClick={() => fetchMessages(true)}
                                    className="text-xs px-3 py-1.5 rounded-full border border-warm-border text-warm-muted hover:text-warm-text hover:bg-white transition"
                                    type="button"
                                    disabled={sending}
                                >
                                    Refresh
                                </button>
                            </div>

                            <div className="max-h-[620px] overflow-y-auto">
                                {threadItems.map((thread) => (
                                    <button
                                        key={thread.threadId}
                                        type="button"
                                        className="w-full text-left px-4 py-3.5 hover:bg-primary-50/60 transition bg-primary-50 border-l-4 border-primary-500 pl-3"
                                    >
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <p className="font-semibold text-sm text-warm-text truncate">{thread.title}</p>
                                            {Number(thread.unreadCount) > 0 && (
                                                <span className="text-2xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">{thread.unreadCount}</span>
                                            )}
                                        </div>
                                        <p className="text-2xs text-warm-faded mb-1">{thread.subtitle}</p>
                                        <p className="text-xs text-warm-muted truncate">{thread.lastMessage}</p>
                                        {thread.lastMessageAt && (
                                            <p className="text-2xs text-warm-faded mt-1">{formatTime(thread.lastMessageAt)}</p>
                                        )}
                                    </button>
                                ))}

                                <div className="px-4 py-4 border-t border-warm-border/50">
                                    <div className="rounded-xl border border-primary-100 bg-primary-50/60 p-3">
                                        <p className="text-xs font-semibold text-primary-800 mb-1">Support Tips</p>
                                        <p className="text-2xs text-primary-700 leading-relaxed">
                                            Include your pet name or application id for faster replies from the admin team.
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </aside>

                        <div className="flex flex-col min-h-[680px]">
                            <div className="px-5 md:px-7 py-4 border-b border-warm-border/60 bg-primary-50/60 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 text-white flex items-center justify-center shrink-0">
                                        <FaUserShield />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-warm-text truncate">Administrator</p>
                                        <div className="mt-1 flex items-center gap-2 text-2xs">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border ${
                                                adminOnline
                                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                                    : 'text-warm-faded bg-white border-warm-border'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${adminOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                {adminOnline ? 'Online' : 'Offline'}
                                            </span>
                                            {adminTyping ? (
                                                <span className="text-primary-700 bg-primary-50 border border-primary-200 rounded-full px-2 py-0.5">
                                                    Typing...
                                                </span>
                                            ) : (
                                                <span className="text-warm-faded">Usually replies within a few hours</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-2xs text-primary-800 bg-primary-100 border border-primary-200 rounded-full px-2.5 py-1">
                                    {threadId ? `Thread #${threadId}` : 'New conversation'}
                                </span>
                            </div>

                            {pageLoading ? (
                                <div className="flex-1 flex items-center justify-center text-warm-muted text-sm">Loading messages...</div>
                            ) : (
                                <>
                                    <div ref={listRef} className="flex-1 overflow-y-auto px-4 md:px-6 py-5 bg-gradient-to-b from-white to-[#FFF9EC]">
                                        {messages.length === 0 ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center px-4">
                                                <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mb-4">
                                                    <FaHeadset size={22} />
                                                </div>
                                                <h2 className="font-heading text-2xl text-warm-text mb-2">Start the conversation</h2>
                                                <p className="text-sm text-warm-muted max-w-sm">
                                                    Send your first message and the admin team will assist you directly in this chat.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {messages.map((item) => {
                                                    const isOwn = Number(item.senderUserId) === Number(user.id);
                                                    return (
                                                        <div key={item.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                            <div
                                                                className={`max-w-[85%] md:max-w-[70%] rounded-2xl px-4 py-3 border shadow-sm ${
                                                                    isOwn
                                                                        ? 'bg-primary-600 text-white border-primary-700 rounded-br-md'
                                                                        : 'bg-white text-warm-text border-warm-border rounded-bl-md'
                                                                }`}
                                                            >
                                                                <p className="text-sm whitespace-pre-wrap break-words">{item.message}</p>
                                                                <p className={`text-2xs mt-2 ${isOwn ? 'text-primary-100' : 'text-warm-faded'}`}>
                                                                    {isOwn ? 'You' : 'Administrator'} • {formatTime(item.createdAt)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>

                                    <form onSubmit={handleSend} className="p-4 md:p-5 border-t border-warm-border/60 bg-white">
                                        <label htmlFor="supportMessage" className="sr-only">Message</label>
                                        <div className="flex items-end gap-3">
                                            <textarea
                                                id="supportMessage"
                                                value={draft}
                                                onChange={(event) => setDraft(event.target.value)}
                                                placeholder="Type your message to admin..."
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
