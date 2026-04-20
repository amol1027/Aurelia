import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Navigate } from 'react-router-dom';
import { FaComments, FaPaperPlane, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
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

export default function AdminMessages() {
    const { user, token, loading, logout } = useAuth();
    const { error, info, success } = useNotification();

    const [threads, setThreads] = useState([]);
    const [threadsLoading, setThreadsLoading] = useState(true);
    const [selectedThreadId, setSelectedThreadId] = useState(null);
    const [activeThread, setActiveThread] = useState(null);
    const [messages, setMessages] = useState([]);
    const [activePresence, setActivePresence] = useState({ userOnline: false, userTyping: false });
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const listRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const lastTypingSentRef = useRef(false);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    const fetchThreads = useCallback(async (showLoading = false) => {
        if (!token) return;

        if (showLoading) setThreadsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/messages/admin/threads`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await parseApiResponse(response);

            if (!data) {
                throw new Error('Server returned non-JSON data. Check backend URL and API server status.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch chat threads');
            }

            const nextThreads = Array.isArray(data) ? data : [];
            setThreads(nextThreads);

            if (nextThreads.length === 0) {
                setSelectedThreadId(null);
                setActiveThread(null);
                setMessages([]);
                return;
            }

            if (!selectedThreadId || !nextThreads.some((item) => item.threadId === selectedThreadId)) {
                setSelectedThreadId(nextThreads[0].threadId);
            }
        } catch (err) {
            error(err.message || 'Failed to fetch chat threads');
        } finally {
            if (showLoading) setThreadsLoading(false);
        }
    }, [token, selectedThreadId, error]);

    const fetchThreadDetail = useCallback(async (threadId, showLoading = false) => {
        if (!token || !threadId) return;

        if (showLoading) setMessagesLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/api/messages/admin/threads/${threadId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await parseApiResponse(response);

            if (!data) {
                throw new Error('Server returned non-JSON data. Check backend URL and API server status.');
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load conversation');
            }

            setActiveThread(data.thread || null);
            setMessages(Array.isArray(data.messages) ? data.messages : []);
            setActivePresence({
                userOnline: Boolean(data?.presence?.userOnline),
                userTyping: Boolean(data?.presence?.userTyping),
            });
        } catch (err) {
            error(err.message || 'Failed to load conversation');
        } finally {
            if (showLoading) setMessagesLoading(false);
        }
    }, [token, error]);

    const sendTypingStatus = useCallback(async (isTyping) => {
        if (!token || !selectedThreadId) return;
        if (lastTypingSentRef.current === isTyping) return;

        try {
            lastTypingSentRef.current = isTyping;
            await fetch(`${API_BASE_URL}/api/messages/admin/threads/${selectedThreadId}/typing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ isTyping }),
            });
        } catch {
            // Typing indicators are best effort and should never block chat usage.
        }
    }, [token, selectedThreadId]);

    useEffect(() => {
        if (!token || !user || user.role !== 'admin') return;

        fetchThreads(true);
        const interval = setInterval(() => fetchThreads(false), 8000);
        return () => clearInterval(interval);
    }, [token, user, fetchThreads]);

    useEffect(() => {
        if (!token || !selectedThreadId) return;

        fetchThreadDetail(selectedThreadId, true);
        const interval = setInterval(() => fetchThreadDetail(selectedThreadId, false), 5000);
        return () => clearInterval(interval);
    }, [token, selectedThreadId, fetchThreadDetail]);

    useEffect(() => {
        if (!listRef.current) return;
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (!token || !selectedThreadId) return;

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
    }, [draft, token, selectedThreadId, sendTypingStatus]);

    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!selectedThreadId) return;
        lastTypingSentRef.current = false;
    }, [selectedThreadId]);

    const handleLogout = () => {
        logout();
        info('Admin logged out successfully');
        setMenuOpen(false);
    };

    const handleSend = async (event) => {
        event.preventDefault();
        const message = draft.trim();

        if (!message || !selectedThreadId || sending || !token) return;

        try {
            setSending(true);
            const response = await fetch(`${API_BASE_URL}/api/messages/admin/threads/${selectedThreadId}`, {
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
                throw new Error(data.error || 'Failed to send reply');
            }

            setDraft('');
            await sendTypingStatus(false);
            success('Reply sent');
            await fetchThreadDetail(selectedThreadId, false);
            await fetchThreads(false);
        } catch (err) {
            error(err.message || 'Failed to send reply');
        } finally {
            setSending(false);
        }
    };

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

    return (
        <div className="min-h-dvh bg-warm-bg">
            <header className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-2xl border-b border-warm-border/60">
                <nav className="max-w-[1320px] mx-auto px-6 h-[64px] flex items-center justify-between" aria-label="Admin messaging navigation">
                    <div className="flex items-center gap-5">
                        <Link to="/admin" className="flex items-center gap-2 font-heading text-xl font-bold shrink-0">
                            <FaUserShield className="text-accent-600" />
                            <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                                Admin Panel
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {[
                                { label: 'Overview', to: '/admin', end: true },
                                { label: 'Users', to: '/admin/users' },
                                { label: 'List Pets', to: '/admin/pets' },
                                { label: 'Messages', to: '/admin/messages' },
                            ].map(({ label, to, end }) => (
                                <NavLink
                                    key={to + label}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ` +
                                        (isActive
                                            ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                            : 'text-warm-muted hover:text-warm-text hover:bg-warm-border/30')
                                    }
                                >
                                    {label}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex p-2 rounded-lg text-warm-faded hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            aria-label="Logout"
                        >
                            <FaSignOutAlt size={18} />
                        </button>

                        <button
                            className="flex md:hidden items-center justify-center text-warm-text z-[60]"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
                        </button>
                    </div>
                </nav>

                {menuOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-[55] md:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}
                <div
                    className={`fixed top-0 right-0 w-[280px] h-dvh bg-[#FFFDF7] z-[60] flex flex-col shadow-[-8px_0_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex items-center justify-between px-6 h-[64px] border-b border-warm-border/60">
                        <span className="font-heading font-bold text-lg bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                        <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1 text-warm-faded hover:text-warm-text">
                            <HiX size={22} />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-1 px-4 pt-6 flex-1" aria-label="Admin mobile navigation">
                        {[
                            { label: 'Overview', to: '/admin', end: true },
                            { label: 'Users', to: '/admin/users' },
                            { label: 'List Pets', to: '/admin/pets' },
                            { label: 'Messages', to: '/admin/messages' },
                            { label: 'Main Site', to: '/', end: true },
                        ].map(({ label, to, end }) => (
                            <NavLink
                                key={to + label}
                                to={to}
                                end={end}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ` +
                                    (isActive
                                        ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                        : 'text-warm-muted hover:text-warm-text hover:bg-warm-border/30')
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="px-4 pb-8 border-t border-warm-border/60 pt-4">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 transition-all duration-200"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1320px] mx-auto px-6 py-10 md:py-12">
                <div className="mb-6">
                    <span className="section-label">Messaging Center</span>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-warm-text mb-2">Admin Support Inbox</h1>
                    <p className="text-warm-muted text-sm md:text-base">Respond to adopter and shelter messages in real time.</p>
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
                                    <div className="px-4 py-10 text-center text-warm-muted text-sm">
                                        No support conversations yet.
                                    </div>
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
                                                        <p className="font-semibold text-sm text-warm-text truncate">{thread.userName}</p>
                                                        {Number(thread.unreadCount) > 0 && (
                                                            <span className="text-2xs font-bold text-white bg-red-500 rounded-full px-2 py-0.5">
                                                                {thread.unreadCount}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-2xs text-warm-faded mb-1">
                                                        {thread.userRole === 'shelter' ? 'Shelter' : 'Adopter'}
                                                        {thread.shelterName ? ` • ${thread.shelterName}` : ''}
                                                    </p>
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
                                    <p className="text-sm text-warm-muted">Choose a conversation on the left to start replying.</p>
                                </div>
                            ) : (
                                <>
                                    <div className="px-5 py-4 border-b border-warm-border/60 bg-primary-50/40">
                                        <h3 className="font-semibold text-warm-text">{activeThread?.userName || 'User'}</h3>
                                        <p className="text-xs text-warm-faded">{activeThread?.userEmail || ''}</p>
                                        <div className="mt-1.5 flex items-center gap-2 text-2xs">
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border ${
                                                activePresence.userOnline
                                                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                                                    : 'text-warm-faded bg-white border-warm-border'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${activePresence.userOnline ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                                                {activePresence.userOnline ? 'Online' : 'Offline'}
                                            </span>
                                            {activePresence.userTyping && (
                                                <span className="text-primary-700 bg-primary-50 border border-primary-200 rounded-full px-2 py-0.5">
                                                    Typing...
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {messagesLoading ? (
                                        <div className="flex-1 flex items-center justify-center text-warm-muted text-sm">Loading conversation...</div>
                                    ) : (
                                        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-5 bg-gradient-to-b from-white to-[#FFF9EC]">
                                            {messages.length === 0 ? (
                                                <div className="h-full flex items-center justify-center text-sm text-warm-muted">
                                                    No messages yet in this thread.
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {messages.map((item) => {
                                                        const isAdmin = item.senderRole === 'admin';
                                                        return (
                                                            <div key={item.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                                                <div
                                                                    className={`max-w-[82%] rounded-2xl px-4 py-3 border shadow-sm ${
                                                                        isAdmin
                                                                            ? 'bg-accent-700 text-white border-accent-800 rounded-br-md'
                                                                            : 'bg-white text-warm-text border-warm-border rounded-bl-md'
                                                                    }`}
                                                                >
                                                                    <p className="text-sm whitespace-pre-wrap break-words">{item.message}</p>
                                                                    <p className={`text-2xs mt-2 ${isAdmin ? 'text-accent-100' : 'text-warm-faded'}`}>
                                                                        {isAdmin ? 'Administrator' : activeThread?.userName || 'User'} • {formatTime(item.createdAt)}
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
                                                placeholder="Type your reply..."
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
                                                {sending ? 'Sending...' : 'Reply'}
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
        </div>
    );
}
