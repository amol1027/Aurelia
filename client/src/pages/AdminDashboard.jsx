import { useState, useEffect } from 'react';
import { Link, NavLink, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUsers, FaDog, FaBuilding, FaUserShield,
    FaSignOutAlt, FaHeart, FaComments
} from 'react-icons/fa';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

/* ── Animation variants ───────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
    }),
};

/* ── Admin Dashboard ────────────────────────────────────────────── */
export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const { info } = useNotification();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPets: 0,
        adopters: 0,
        shelters: 0,
    });
    const [greeting, setGreeting] = useState('');
    const [toast, setToast] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    useEffect(() => {
        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/api/admin/stats')
            .then(r => r.json())
            .then(data => setStats(data))
            .catch(() => {});
    }, []);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

    const handleLogout = () => {
        logout();
        info('Admin logged out successfully');
        setMenuOpen(false);
    };

    const showToast = (label) => {
        setToast(label);
        setTimeout(() => setToast(null), 2200);
    };

    const adminCards = [
        {
            icon: FaUsers,
            label: 'Total Users',
            value: stats.totalUsers,
            color: 'from-primary-300 to-primary-500',
            bgColor: 'bg-primary-50',
        },
        {
            icon: FaDog,
            label: 'Total Pets',
            value: stats.totalPets,
            color: 'from-primary-400 to-primary-600',
            bgColor: 'bg-primary-50',
        },
        {
            icon: FaUsers,
            label: 'Adopters',
            value: stats.adopters,
            color: 'from-accent-400 to-accent-600',
            bgColor: 'bg-accent-50',
        },
        {
            icon: FaBuilding,
            label: 'Shelters',
            value: stats.shelters,
            color: 'from-accent-600 to-accent-800',
            bgColor: 'bg-accent-50',
        },
    ];

    const quickActions = [
        { icon: FaUsers, label: 'Manage Users', description: 'View and manage all users', to: '/admin/users' },
        { icon: FaDog, label: 'Manage Pets', description: 'View all pet listings', to: '/admin/pets' },
        { icon: FaBuilding, label: 'Manage Shelters', description: 'View shelter details', to: '/admin/users' },
        { icon: FaComments, label: 'Messages', description: 'Reply to user and shelter support chats', to: '/admin/messages' },
        { icon: FaHeart, label: 'Adoptions', description: 'View adoption records', to: '/admin/pets' },
    ];

    return (
        <div className="min-h-dvh bg-warm-bg">
            {/* ─── Sticky nav ─── */}
            <header className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-2xl border-b border-warm-border/60">
                <nav className="max-w-[1320px] mx-auto px-6 h-[64px] flex items-center justify-between" aria-label="Admin navigation">
                    {/* Logo + desktop nav links */}
                    <div className="flex items-center gap-5">
                        <Link to="/admin" className="flex items-center gap-2 font-heading text-xl font-bold shrink-0">
                            <FaUserShield className="text-accent-600 transition-transform duration-300 hover:rotate-[-12deg] hover:scale-110" />
                            <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                                Admin Panel
                            </span>
                        </Link>

                        {/* Desktop nav links */}
                        <div className="hidden md:flex items-center gap-1">
                            {[
                                { label: 'Overview', to: '/admin', end: true },
                                { label: 'Messages', to: '/admin/messages' },
                                { label: 'Main Site', to: '/', end: true },
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
                        {/* Desktop Admin Profile */}
                        <div className="hidden sm:flex items-center gap-2 bg-accent-50 backdrop-blur-md rounded-full pl-1 pr-4 py-1 border border-accent-200">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-700
                                flex items-center justify-center text-white text-xs font-bold shadow-warm-sm">
                                <FaUserShield />
                            </div>
                            <span className="text-sm font-semibold text-warm-text">Administrator</span>
                        </div>

                        {/* Mobile Admin Profile */}
                        <div className="flex sm:hidden items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-700
                                flex items-center justify-center text-white text-xs font-bold shadow-warm-sm">
                                <FaUserShield />
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex p-2 rounded-lg text-warm-faded hover:text-red-600 hover:bg-red-50 
                                transition-all duration-200"
                            aria-label="Logout"
                        >
                            <FaSignOutAlt size={18} />
                        </button>

                        {/* Mobile hamburger */}
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

                {/* ─── Mobile slide-out drawer ─── */}
                {menuOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-[55] md:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}
                <div
                    className={`fixed top-0 right-0 w-[280px] h-dvh bg-[#FFFDF7] z-[60] flex flex-col
                            { label: 'Messages', to: '/admin/messages' },
                        shadow-[-8px_0_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out md:hidden
                        ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    {/* Drawer header */}
                    <div className="flex items-center justify-between px-6 h-[64px] border-b border-warm-border/60">
                        <span className="font-heading font-bold text-lg bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                        <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1 text-warm-faded hover:text-warm-text">
                            <HiX size={22} />
                        </button>
                    </div>

                    {/* Drawer links */}
                    <nav className="flex flex-col gap-1 px-4 pt-6 flex-1" aria-label="Admin mobile navigation">
                        {[
                            { label: 'Overview', to: '/admin', end: true },
                            { label: 'Users', to: '/admin/users' },
                            { label: 'List Pets', to: '/admin/pets' },
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

                    {/* Drawer footer */}
                    <div className="px-4 pb-8 border-t border-warm-border/60 pt-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-accent-700
                                flex items-center justify-center text-white text-xs font-bold shadow-warm-sm">
                                <FaUserShield />
                            </div>
                            <span className="text-sm font-semibold text-warm-text">Administrator</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                                text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100
                                transition-all duration-200"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* ─── Content ─── */}
            <main className="max-w-[1320px] mx-auto px-6 py-16 md:py-24">
                {/* Greeting */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    className="mb-8"
                >
                    <span className="section-label">Admin Dashboard</span>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-warm-text mb-2">
                        {greeting}, Administrator 👋
                    </h1>
                    <p className="text-warm-muted text-sm md:text-base">
                        Welcome to the Aurelia admin dashboard. Manage your platform here.
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    custom={1}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8"
                >
                    {adminCards.map((card, i) => (
                        <motion.div
                            key={card.label}
                            custom={i + 1}
                            variants={fadeUp}
                            className={`${card.bgColor} rounded-2xl p-6 border border-warm-border/40 shadow-warm-sm
                                hover:shadow-warm-md transition-all duration-300`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color}
                                    flex items-center justify-center text-white shadow-warm-sm`}
                                >
                                    <card.icon size={20} />
                                </div>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-warm-text mb-1">
                                {card.value}
                            </p>
                            <p className="text-sm text-warm-muted font-medium">{card.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    custom={5}
                    className="mb-8"
                >
                    <span className="section-label">Quick Actions</span>
                    <h2 className="font-heading text-xl md:text-2xl font-bold text-warm-text mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {quickActions.map((action, i) => {
                            const Wrapper = action.to !== '#' ? Link : 'div';
                            const wrapperProps = action.to !== '#' 
                                ? { to: action.to } 
                                : { onClick: () => showToast(`${action.label} - Coming soon!`) };

                            return (
                                <motion.div
                                    key={action.label}
                                    custom={i + 6}
                                    variants={fadeUp}
                                >
                                    <Wrapper
                                        {...wrapperProps}
                                        className="block bg-white rounded-2xl p-6 border border-warm-border/60 
                                            hover:border-primary-300 hover:shadow-warm-md transition-all duration-300
                                            cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600
                                                flex items-center justify-center text-white shadow-warm-sm
                                                group-hover:scale-110 transition-transform duration-300"
                                            >
                                                <action.icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-warm-text mb-1 group-hover:text-primary-700 transition-colors">
                                                    {action.label}
                                                </h3>
                                                <p className="text-sm text-warm-muted">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </div>
                                    </Wrapper>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>


            </main>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]
                            bg-warm-text text-white px-6 py-3 rounded-xl shadow-2xl
                            font-medium text-sm whitespace-nowrap"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
