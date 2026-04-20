import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPaw, FaHeart, FaClipboardList, FaUserCircle, FaBookOpen,
    FaComments, FaPlusCircle, FaThList, FaEnvelopeOpenText, FaHome,
    FaSignOutAlt, FaDog, FaCat, FaArrowRight, FaUserShield
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useFavorites } from '../context/FavoritesContext';

/* ── Animation variants ───────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] },
    }),
};

/* ── Dashboard ────────────────────────────────────────────── */
export default function Dashboard() {
    const { user, loading, logout } = useAuth();
    const { info } = useNotification();
    const { count: favoritesCount } = useFavorites();
    const [toast, setToast] = useState(null);
    const [petCount, setPetCount] = useState(0);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
    }, []);

    useEffect(() => {
        fetch('http://localhost:5000/api/pets')
            .then(r => r.json())
            .then(d => setPetCount(d.length))
            .catch(() => { });
    }, []);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    const firstName = user.name.split(' ')[0];
    const isShelter = user.role === 'shelter';

    const handleLogout = () => {
        logout();
        info('You have been logged out successfully');
    };

    const showToast = (label) => {
        setToast(label);
        setTimeout(() => setToast(null), 2200);
    };

    /* Card click handler — navigates or shows toast */
    const go = (item) => { if (!item.to) showToast(item.label); };

    /* Wrap in Link if navigable */
    const Wrap = ({ item, children }) =>
        item.to
            ? <Link to={item.to} className="contents">{children}</Link>
            : <div className="contents" onClick={() => go(item)}>{children}</div>;

    return (
        <div className="min-h-dvh bg-warm-bg">
            {/* ─── Sticky nav ─── */}
            <header className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-2xl border-b border-warm-border/60">
                <div className="max-w-[1320px] mx-auto px-6 h-[64px] flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
                        <FaPaw className="text-primary-600 transition-transform duration-300 hover:rotate-[-12deg] hover:scale-110" />
                        <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                            Aurelia
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        {/* Admin Panel shortcut — only for admin role */}
                        {user.role === 'admin' && (
                            <Link
                                to="/admin"
                                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg
                                    bg-accent-50 hover:bg-accent-100 border border-accent-200 hover:border-accent-300
                                    text-accent-700 hover:text-accent-800 transition-all duration-200 text-sm font-semibold"
                            >
                                <FaUserShield size={13} />
                                <span>Admin Panel</span>
                            </Link>
                        )}

                        {/* Desktop User Profile */}
                        <div className="hidden sm:flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full pl-1 pr-4 py-1 border border-warm-border/50">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                                flex items-center justify-center text-white text-xs font-bold shadow-warm-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-warm-text">{firstName}</span>
                        </div>
                        
                        {/* Mobile User Profile - Avatar only */}
                        <div className="flex sm:hidden items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                                flex items-center justify-center text-white text-xs font-bold shadow-warm-sm">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        
                        {/* Desktop Logout - Icon only */}
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex p-2.5 rounded-xl text-warm-faded hover:text-red-500
                                hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100"
                            aria-label="Logout"
                        >
                            <FaSignOutAlt className="text-[0.9rem]" />
                        </button>
                        
                        {/* Mobile Logout - Icon + Text */}
                        <button
                            onClick={handleLogout}
                            className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                text-warm-faded hover:text-red-500 hover:bg-red-50 transition-all duration-200 
                                border border-warm-border hover:border-red-100"
                            aria-label="Logout"
                        >
                            <FaSignOutAlt className="text-xs" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1320px] mx-auto px-6 pt-10 pb-20 relative">
                {/* ─── Background orbs ─── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute -top-[120px] right-[10%] w-[500px] h-[500px] rounded-full
                        bg-[radial-gradient(circle,_#FFE08225,_transparent_70%)] blur-[100px]" />
                    <div className="absolute bottom-[10%] -left-[5%] w-[400px] h-[400px] rounded-full
                        bg-[radial-gradient(circle,_#FFE0B220,_transparent_70%)] blur-[100px]" />
                </div>

                {/* ─── Greeting row ─── */}
                <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="mb-10">
                    <p className="text-warm-faded text-sm font-medium tracking-wide uppercase mb-1">{greeting}</p>
                    <h1 className="font-heading font-bold text-[clamp(1.8rem,4vw,2.8rem)] text-warm-text leading-[1.15]">
                        Welcome back, <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">{firstName}</span> 👋
                    </h1>
                    <p className="text-warm-muted mt-2 max-w-lg text-[0.95rem]">
                        {isShelter
                            ? 'Manage your shelter listings and review adoption applications.'
                            : 'Your adoption journey starts here — explore, save, and adopt.'}
                    </p>
                </motion.div>

                {/* ════════════════════════════════════════════
                     BENTO GRID — Asymmetric modern layout
                    ════════════════════════════════════════════ */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 auto-rows-min">

                    {/* ── FEATURED: Browse Pets (large hero card) ── */}
                    <motion.div custom={1} variants={fadeUp} initial="hidden" animate="show"
                        className="lg:col-span-7 md:col-span-2">
                        <Link to="/pets" className="block group">
                            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-600 to-amber-600
                                p-8 md:p-10 min-h-[220px] flex flex-col justify-between
                                shadow-warm-lg hover:shadow-[0_12px_40px_rgba(255,193,7,0.35)]
                                transition-all duration-400 hover:-translate-y-1 cursor-pointer">
                                {/* Floating paw watermarks */}
                                <div className="absolute -right-4 -bottom-4 text-primary-300/15 text-[10rem]">
                                    <FaPaw />
                                </div>
                                <div className="absolute right-24 top-4 text-primary-300/10 text-[4rem] rotate-[20deg]">
                                    <FaPaw />
                                </div>

                                <div className="relative z-10">
                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest
                                        text-white/80 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full mb-4">
                                        🐾 Featured
                                    </span>
                                    <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-2">
                                        Browse Pets
                                    </h2>
                                    <p className="text-white/80 text-sm md:text-base max-w-sm">
                                        Discover {petCount > 0 ? petCount : ''} adorable pets waiting for their forever home.
                                    </p>
                                </div>

                                <div className="relative z-10 flex items-center gap-2 mt-6">
                                    <span className="inline-flex items-center gap-2 text-sm font-semibold text-white
                                        bg-white/20 backdrop-blur-md px-5 py-2.5 rounded-full
                                        group-hover:bg-white/30 transition-all duration-300">
                                        Explore Now <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* ── STATS column ── */}
                    <motion.div custom={2} variants={fadeUp} initial="hidden" animate="show"
                        className="lg:col-span-5 grid grid-cols-2 gap-5">
                        {/* Stat 1 */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-5
                            shadow-warm-sm hover:shadow-warm-md transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600
                                flex items-center justify-center text-white text-sm mb-3 shadow-warm-sm">
                                <FaDog />
                            </div>
                            <p className="font-heading text-2xl font-bold text-warm-text">{petCount || '—'}</p>
                            <p className="text-xs text-warm-faded mt-0.5">Pets Available</p>
                        </div>
                        {/* Stat 2 */}
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-5
                            shadow-warm-sm hover:shadow-warm-md transition-all duration-300">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-red-500
                                flex items-center justify-center text-white text-sm mb-3 shadow-warm-sm">
                                <FaHeart />
                            </div>
                            <p className="font-heading text-2xl font-bold text-warm-text">{favoritesCount}</p>
                            <p className="text-xs text-warm-faded mt-0.5">Saved Favorites</p>
                        </div>
                        {/* Profile card */}
                        <div className="col-span-2 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 p-5
                            shadow-warm-sm hover:shadow-warm-md transition-all duration-300
                            flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                                flex items-center justify-center text-white text-lg font-bold shadow-warm-md shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                                <p className="font-heading font-bold text-warm-text text-base truncate">{user.name}</p>
                                <p className="text-xs text-warm-faded capitalize flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                                    {user.role} · Active
                                </p>
                            </div>
                            <span className="ml-auto text-2xs font-semibold text-primary-700 bg-primary-50
                                border border-primary-100 px-2.5 py-0.5 rounded-full capitalize shrink-0">
                                {user.role}
                            </span>
                        </div>
                    </motion.div>

                    {/* ── Quick actions heading ── */}
                    <motion.div custom={3} variants={fadeUp} initial="hidden" animate="show"
                        className="lg:col-span-12 md:col-span-2 mt-3 mb-1">
                        <h2 className="font-heading text-lg font-bold text-warm-text">Quick Actions</h2>
                        <p className="text-sm text-warm-faded">Everything you need, one click away.</p>
                    </motion.div>

                    {/* ── Action cards ── */}
                    {(isShelter ? shelterActions : adopterActions).map((item, i) => (
                        <motion.div key={item.label} custom={4 + i} variants={fadeUp} initial="hidden" animate="show"
                            className={`${item.span || 'lg:col-span-3'} md:col-span-1`}>
                            <Wrap item={item}>
                                <div className={`group relative overflow-hidden rounded-2xl
                                    bg-white/70 backdrop-blur-xl border border-white/60
                                    p-6 h-full min-h-[155px] flex flex-col justify-between
                                    shadow-warm-sm cursor-pointer
                                    transition-all duration-300 ease-out
                                    hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(45,34,25,0.10),0_0_30px_rgba(255,193,7,0.15)]
                                    hover:border-primary-200`}>
                                    {/* Gradient blob */}
                                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full
                                        bg-gradient-to-br ${item.color} opacity-[0.07]
                                        group-hover:opacity-[0.14] group-hover:scale-150
                                        transition-all duration-500`} />

                                    <div className="relative z-10">
                                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color}
                                            flex items-center justify-center text-white text-base
                                            shadow-warm-sm mb-4
                                            group-hover:scale-110 group-hover:shadow-glow
                                            transition-all duration-300`}>
                                            <item.icon />
                                        </div>
                                        <h3 className="font-heading text-base font-bold text-warm-text mb-1
                                            group-hover:text-primary-800 transition-colors duration-200">
                                            {item.label}
                                        </h3>
                                        <p className="text-xs text-warm-muted leading-relaxed">{item.desc}</p>
                                    </div>

                                    {/* Arrow + badge */}
                                    <div className="relative z-10 flex items-center justify-between mt-4 pt-3 border-t border-warm-border/40">
                                        {item.to ? (
                                            <span className="text-2xs font-medium text-primary-600 group-hover:text-primary-700 transition-colors">
                                                Open →
                                            </span>
                                        ) : (
                                            <span className="text-2xs font-semibold text-amber-600 bg-amber-50 border border-amber-200
                                                px-2 py-0.5 rounded-full">
                                                Coming Soon
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Wrap>
                        </motion.div>
                    ))}

                    {/* ── CTA banner (full width) ── */}
                    <motion.div custom={9} variants={fadeUp} initial="hidden" animate="show"
                        className="lg:col-span-12 md:col-span-2 mt-3">
                        <div className="relative overflow-hidden rounded-3xl
                            bg-gradient-to-r from-accent-800 via-accent-700 to-accent-600
                            p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6
                            shadow-warm-xl">
                            {/* Watermark */}
                            <div className="absolute -right-6 -bottom-8 text-white/[0.04] text-[11rem] pointer-events-none">
                                <FaPaw />
                            </div>
                            <div>
                                <h3 className="font-heading text-xl md:text-2xl font-bold text-white mb-1">
                                    Ready to make a difference?
                                </h3>
                                <p className="text-white/60 text-sm max-w-md">
                                    Thousands of pets are waiting for a loving home. Your perfect companion is just a click away.
                                </p>
                            </div>
                            <Link to="/pets"
                                className="shrink-0 inline-flex items-center gap-2 font-semibold text-sm
                                    bg-gradient-to-br from-primary-400 to-primary-600 text-warm-dark
                                    px-7 py-3 rounded-full shadow-warm-md
                                    hover:shadow-warm-lg hover:-translate-y-0.5
                                    transition-all duration-300">
                                <FaPaw /> Browse All Pets
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </main>

            {/* ─── Toast ─── */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                            bg-warm-dark text-white px-6 py-3 rounded-full
                            shadow-warm-xl text-sm font-medium flex items-center gap-2"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                    >
                        <span className="text-primary-400">✨</span>
                        <strong>{toast}</strong> is coming soon!
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

/* ── Action card definitions ──────────────────────────────── */
const adopterActions = [
    { icon: FaPaw, label: 'List Pets', desc: 'Create and manage your own pet listings.', to: '/my-pets', color: 'from-emerald-400 to-emerald-600', span: 'lg:col-span-4' },
    { icon: FaHeart, label: 'My Favorites', desc: 'Pets you\'ve loved & saved for later.', to: '/favorites', color: 'from-rose-400 to-red-500', span: 'lg:col-span-4' },
    { icon: FaClipboardList, label: 'My Applications', desc: 'Track your adoption applications in real time.', to: '/my-applications', color: 'from-amber-400 to-orange-500', span: 'lg:col-span-4' },
    { icon: FaUserCircle, label: 'My Profile', desc: 'Update your info and preferences.', to: '/profile', color: 'from-accent-400 to-accent-600', span: 'lg:col-span-4' },
    { icon: FaComments, label: 'Messages', desc: 'Chat with pet owners and shelters directly.', to: '/messages', color: 'from-indigo-400 to-blue-500', span: 'lg:col-span-4' },
    { icon: FaBookOpen, label: 'How It Works', desc: 'Learn the adoption process step by step.', to: '/how-it-works', color: 'from-teal-400 to-emerald-600', span: 'lg:col-span-4' },
    { icon: FaComments, label: 'Contact Support', desc: 'Have questions? We\'re here to help 24/7.', to: '/support/chat', color: 'from-sky-400 to-blue-500', span: 'lg:col-span-4' },
];

const shelterActions = [
    { icon: FaPlusCircle, label: 'Add New Pet', desc: 'List a new pet for adoption.', to: '/shelter/pets', color: 'from-emerald-400 to-emerald-600', span: 'lg:col-span-4' },
    { icon: FaThList, label: 'Manage Listings', desc: 'Edit or remove your shelter\'s pets.', to: '/shelter/pets', color: 'from-amber-400 to-orange-500', span: 'lg:col-span-4' },
    { icon: FaEnvelopeOpenText, label: 'Applications', desc: 'Review and respond to adoption requests.', to: '/shelter/applications', color: 'from-violet-400 to-purple-500', span: 'lg:col-span-4' },
    { icon: FaComments, label: 'Messages', desc: 'Chat with adopters and listing participants.', to: '/messages', color: 'from-indigo-400 to-blue-500', span: 'lg:col-span-4' },
    { icon: FaHome, label: 'Shelter Profile', desc: 'Update your shelter details and bio.', to: '/profile', color: 'from-accent-400 to-accent-600', span: 'lg:col-span-4' },
    { icon: FaComments, label: 'Contact Support', desc: 'Need assistance? We\'re always here.', to: '/support/chat', color: 'from-sky-400 to-blue-500', span: 'lg:col-span-4' },
];
