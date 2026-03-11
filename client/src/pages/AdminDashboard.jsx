import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPaw, FaUsers, FaDog, FaBuilding, FaChartLine, FaUserShield,
    FaHome, FaSignOutAlt, FaHeart, FaClipboardList, FaCog,
    FaEnvelope, FaExclamationTriangle
} from 'react-icons/fa';
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

    useEffect(() => {
        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    }, []);

    useEffect(() => {
        // Fetch stats
        Promise.all([
            fetch('http://localhost:5000/api/pets').then(r => r.json()),
            // You can add more API calls here for user stats when available
        ])
            .then(([pets]) => {
                setStats(prev => ({
                    ...prev,
                    totalPets: pets.length,
                }));
            })
            .catch(() => { });
    }, []);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

    const handleLogout = () => {
        logout();
        info('Admin logged out successfully');
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
            color: 'from-blue-400 to-blue-600',
            bgColor: 'bg-blue-50',
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
            color: 'from-green-400 to-green-600',
            bgColor: 'bg-green-50',
        },
        {
            icon: FaBuilding,
            label: 'Shelters',
            value: stats.shelters,
            color: 'from-purple-400 to-purple-600',
            bgColor: 'bg-purple-50',
        },
    ];

    const quickActions = [
        { icon: FaUsers, label: 'Manage Users', description: 'View and manage all users', to: '#' },
        { icon: FaDog, label: 'Manage Pets', description: 'View all pets listings', to: '/pets' },
        { icon: FaBuilding, label: 'Manage Shelters', description: 'View shelter details', to: '#' },
        { icon: FaChartLine, label: 'Analytics', description: 'View platform statistics', to: '#' },
        { icon: FaHeart, label: 'Adoptions', description: 'View adoption records', to: '#' },
        { icon: FaEnvelope, label: 'Messages', description: 'View user messages', to: '#' },
    ];

    return (
        <div className="min-h-dvh bg-warm-bg">
            {/* ─── Sticky nav ─── */}
            <header className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-2xl border-b border-warm-border/60">
                <div className="max-w-[1320px] mx-auto px-6 h-[64px] flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
                        <FaUserShield className="text-accent-600 transition-transform duration-300 hover:rotate-[-12deg] hover:scale-110" />
                        <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                    </Link>

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
                            className="p-2 rounded-lg text-warm-faded hover:text-red-600 hover:bg-red-50 
                                transition-all duration-200"
                            aria-label="Logout"
                        >
                            <FaSignOutAlt size={18} />
                        </button>
                    </div>
                </div>
            </header>

            {/* ─── Content ─── */}
            <main className="max-w-[1320px] mx-auto px-6 py-8 md:py-12">
                {/* Greeting */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    className="mb-8"
                >
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

                {/* Back to Site */}
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    custom={12}
                    className="flex justify-center"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl
                            bg-white border border-warm-border text-warm-text
                            hover:border-primary-400 hover:text-primary-700 hover:shadow-warm-md
                            transition-all duration-300 font-medium"
                    >
                        <FaHome /> Back to Main Site
                    </Link>
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
