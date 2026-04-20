import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FaComments, FaPaw, FaSignOutAlt, FaUserShield, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Navbar() {
    const { user, token, loading, isAuthenticated, logout } = useAuth();
    const { info } = useNotification();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [unreadMessageCount, setUnreadMessageCount] = useState(0);
    const showAuthenticatedUi = !loading && isAuthenticated;
    const showGuestUi = !loading && !isAuthenticated;
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

    const handleLogout = () => {
        logout();
        info('You have been logged out successfully');
        setMenuOpen(false);
    };

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    useEffect(() => {
        if (!token || !user || user.role === 'admin') {
            setUnreadMessageCount(0);
            return;
        }

        let mounted = true;

        const fetchUnreadCount = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/messages/direct/threads`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) return;

                const data = await response.json();
                if (!mounted || !Array.isArray(data)) return;

                const unread = data.reduce((total, thread) => total + Number(thread?.unreadCount || 0), 0);
                setUnreadMessageCount(unread);
            } catch {
                // Unread badge is best effort; ignore transient network errors.
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 10000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [token, user, API_BASE_URL]);

    const links = [
        { label: 'Home', href: location.pathname === '/' ? '#hero' : '/#hero' },
        { label: 'Adopt', href: location.pathname === '/' ? '#pets' : '/#pets' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Stories', href: location.pathname === '/' ? '#testimonials' : '/#testimonials' },
    ];

    return (
        <nav
            className="sticky top-0 left-0 w-full h-[72px] z-50 bg-warm-bg/90 backdrop-blur-xl shadow-warm-sm border-b border-warm-border"
            aria-label="Main navigation"
        >
            <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-full">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 font-heading text-2xl font-bold z-[60]">
                    <FaPaw className="text-primary-600 text-xl transition-transform duration-300 hover:rotate-[-12deg] hover:scale-110" />
                    <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                        Aurelia
                    </span>
                </Link>

                {/* Backdrop overlay */}
                {menuOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-[55] md:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}

                {/* Links */}
                <ul
                    className={`flex items-center gap-10
                        max-md:fixed max-md:top-0 max-md:right-0 max-md:w-[280px] max-md:h-dvh
                        max-md:flex-col max-md:justify-center max-md:gap-8
                        max-md:bg-[#FFFDF7] max-md:z-[60]
                        max-md:shadow-[-8px_0_30px_rgba(0,0,0,0.15)]
                        max-md:transition-transform max-md:duration-300 max-md:ease-out
                        ${menuOpen ? 'max-md:translate-x-0' : 'max-md:translate-x-full'}`}
                >
                    {links.map((l) => (
                        <li key={l.href}>
                            <a
                                href={l.href}
                                onClick={() => setMenuOpen(false)}
                                className="relative text-sm font-medium tracking-wide text-warm-muted
                                    hover:text-warm-text transition-colors duration-200
                                    after:content-[''] after:absolute after:bottom-[-2px] after:left-0
                                    after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:to-primary-700
                                    after:rounded-full after:transition-all after:duration-300 after:ease-out
                                    hover:after:w-full
                                    max-md:text-xl max-md:font-semibold"
                            >
                                {l.label}
                            </a>
                        </li>
                    ))}

                    {/* Mobile Auth */}
                    <li className="hidden max-md:flex max-md:flex-col max-md:items-center max-md:gap-3 mt-4">
                        {showAuthenticatedUi ? (
                            <>
                                <span className="text-sm font-semibold text-warm-text">
                                    Hi, {user.name.split(' ')[0]} 👋
                                </span>
                                <span className="text-xs text-warm-faded capitalize px-3 py-0.5 bg-primary-50 rounded-full border border-primary-100">
                                    {user.role}
                                </span>
                                {user.role === 'admin' ? (
                                    <>
                                        <Link to="/admin" onClick={() => setMenuOpen(false)}
                                            className="btn-primary text-sm px-6 py-2">
                                            <FaUserShield /> Admin Panel
                                        </Link>
                                        <Link to="/admin/pets" onClick={() => setMenuOpen(false)}
                                            className="btn-secondary text-sm px-6 py-2">
                                            <FaPaw /> List Pets
                                        </Link>
                                        <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                                            className="btn-secondary text-sm px-6 py-2">
                                            <FaUserCircle /> User View
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                                            className="btn-primary text-sm px-6 py-2">
                                            <FaUserCircle /> Dashboard
                                        </Link>
                                        <Link to="/messages" onClick={() => setMenuOpen(false)}
                                            className="btn-secondary text-sm px-6 py-2 relative">
                                            <FaComments /> Messages
                                            {unreadMessageCount > 0 && (
                                                <span className="ml-1 inline-flex items-center justify-center min-w-[1.2rem] h-[1.2rem] px-1 text-2xs font-bold text-white bg-red-500 rounded-full">
                                                    {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                                </span>
                                            )}
                                        </Link>
                                        <Link
                                            to={user.role === 'shelter' ? '/shelter/pets' : '/my-pets'}
                                            onClick={() => setMenuOpen(false)}
                                                className="btn-secondary text-sm px-6 py-2">
                                            <FaPaw /> List Pets
                                        </Link>
                                        <Link to="/profile" onClick={() => setMenuOpen(false)}
                                            className="btn-secondary text-sm px-6 py-2">
                                            <FaUserCircle /> My Profile
                                        </Link>
                                    </>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="btn-secondary text-sm px-6 py-2"
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </>
                        ) : showGuestUi ? (
                            <>
                                <Link to="/login" onClick={() => setMenuOpen(false)}
                                    className="btn-secondary text-sm px-6 py-2">
                                    Sign In
                                </Link>
                                <Link to="/register" onClick={() => setMenuOpen(false)}
                                    className="btn-primary text-sm px-6 py-2">
                                    Get Started
                                </Link>
                            </>
                        ) : null}
                    </li>
                </ul>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center gap-3">
                    {showAuthenticatedUi ? (
                        <>
                            {user.role === 'admin' ? (
                                <Link to="/admin"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-50
                                        hover:bg-accent-100 border border-accent-200 hover:border-accent-300
                                        text-accent-700 hover:text-accent-800 transition-all duration-200">
                                    <FaUserShield />
                                    <span className="text-sm font-semibold">Admin Panel</span>
                                </Link>
                            ) : (
                                <Link to="/dashboard"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50
                                        hover:bg-primary-100 border border-primary-100 hover:border-primary-200
                                        text-primary-700 hover:text-primary-800 transition-all duration-200">
                                    <FaUserCircle />
                                    <span className="text-sm font-semibold">Dashboard</span>
                                </Link>
                            )}
                            {(user.role === 'shelter' || user.role === 'adopter') && (
                                <Link
                                    to="/messages"
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50
                                        hover:bg-primary-100 border border-primary-100 hover:border-primary-200
                                        text-primary-700 hover:text-primary-800 transition-all duration-200 relative"
                                >
                                    <FaComments />
                                    <span className="text-sm font-semibold">Messages</span>
                                    {unreadMessageCount > 0 && (
                                        <span className="inline-flex items-center justify-center min-w-[1.2rem] h-[1.2rem] px-1 text-2xs font-bold text-white bg-red-500 rounded-full">
                                            {unreadMessageCount > 99 ? '99+' : unreadMessageCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                            {(user.role === 'admin' || user.role === 'shelter' || user.role === 'adopter') && (
                                <Link
                                    to={user.role === 'admin' ? '/admin/pets' : user.role === 'shelter' ? '/shelter/pets' : '/my-pets'}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50
                                        hover:bg-primary-100 border border-primary-100 hover:border-primary-200
                                        text-primary-700 hover:text-primary-800 transition-all duration-200"
                                >
                                    <FaPaw />
                                    <span className="text-sm font-semibold">List Pets</span>
                                </Link>
                            )}
                            <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                                    flex items-center justify-center text-white text-xs font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold text-warm-text leading-tight">{user.name.split(' ')[0]}</span>
                                    <span className="text-2xs text-warm-faded capitalize">{user.role}</span>
                                </div>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="ml-1 p-2 rounded-lg text-warm-faded hover:text-red-500
                                    hover:bg-red-50 transition-all duration-200"
                                aria-label="Logout"
                            >
                                <FaSignOutAlt />
                            </button>
                        </>
                    ) : showGuestUi ? (
                        <>
                            <Link to="/login" className="text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary text-sm px-6 py-2.5">
                                Get Started
                            </Link>
                        </>
                    ) : null}
                </div>

                {/* Mobile Toggle */}
                <button
                    className="hidden max-md:flex items-center justify-center text-warm-text z-[60]"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                    aria-expanded={menuOpen}
                >
                    {menuOpen ? <HiX size={26} /> : <HiMenuAlt3 size={26} />}
                </button>
            </div>
        </nav>
    );
}
