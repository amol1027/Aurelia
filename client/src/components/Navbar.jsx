import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { FaPaw, FaSignOutAlt, FaUserShield, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { info } = useNotification();
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

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

    const links = [
        { label: 'Home', href: '#hero' },
        { label: 'Adopt', href: '#pets' },
        { label: 'How It Works', href: '/how-it-works' },
        { label: 'Stories', href: '#testimonials' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 w-full h-[72px] z-50 transition-all duration-300 ease-out
                ${scrolled ? 'bg-warm-bg/85 backdrop-blur-xl shadow-warm-sm border-b border-warm-border' : ''}`}
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
                        {user ? (
                            <>
                                <span className="text-sm font-semibold text-warm-text">
                                    Hi, {user.name.split(' ')[0]} 👋
                                </span>
                                <span className="text-xs text-warm-faded capitalize px-3 py-0.5 bg-primary-50 rounded-full border border-primary-100">
                                    {user.role}
                                </span>
                                {user.role === 'admin' ? (
                                    <Link to="/admin" onClick={() => setMenuOpen(false)}
                                        className="btn-primary text-sm px-6 py-2">
                                        <FaUserShield /> Admin Panel
                                    </Link>
                                ) : (
                                    <Link to="/profile" onClick={() => setMenuOpen(false)}
                                        className="btn-secondary text-sm px-6 py-2">
                                        <FaUserCircle /> My Profile
                                    </Link>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="btn-secondary text-sm px-6 py-2"
                                >
                                    <FaSignOutAlt /> Logout
                                </button>
                            </>
                        ) : (
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
                        )}
                    </li>
                </ul>

                {/* Desktop Auth */}
                <div className="hidden md:flex items-center gap-3">
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" 
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-50 
                                        hover:bg-accent-100 border border-accent-200 hover:border-accent-300
                                        text-accent-700 hover:text-accent-800 transition-all duration-200">
                                    <FaUserShield />
                                    <span className="text-sm font-semibold">Admin Panel</span>
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
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="btn-primary text-sm px-6 py-2.5">
                                Get Started
                            </Link>
                        </>
                    )}
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
