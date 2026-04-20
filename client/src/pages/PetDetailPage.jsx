import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaPaw, FaHeart, FaArrowLeft, FaClock, FaDog, FaSignOutAlt,
    FaChevronRight, FaCheckCircle, FaStar, FaComments
} from 'react-icons/fa';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNotification } from '../context/NotificationContext';

/* ── Animation variants ─────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    show: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
    }),
};
const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
};

/* ── Helpers ─────────────────────────────────────────────── */
function speciesEmoji(breed = '') {
    const b = breed.toLowerCase();
    if (['cat','persian','siamese','ragdoll','bengal','maine','scottish','birman'].some(x => b.includes(x))) return '🐱';
    return '🐶';
}

const tagColors = [
    'bg-primary-50 text-primary-800 border-primary-100',
    'bg-emerald-50 text-emerald-800 border-emerald-100',
    'bg-violet-50 text-violet-800 border-violet-100',
    'bg-sky-50 text-sky-800 border-sky-100',
    'bg-rose-50 text-rose-800 border-rose-100',
    'bg-amber-50 text-amber-800 border-amber-100',
];

/* ════════════════════════════════════════════════════════════
   PetDetailPage
   ════════════════════════════════════════════════════════════ */
export default function PetDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { success, info } = useNotification();

    const [pet, setPet]           = useState(null);
    const [allPets, setAllPets]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const showAuthenticatedUi = !authLoading && isAuthenticated;
    const showGuestUi = !authLoading && !isAuthenticated;

    useEffect(() => {
        setLoading(true); setNotFound(false);
        fetch(`http://localhost:5000/api/pets/${id}`)
            .then(res => { if (!res.ok) { setNotFound(true); setLoading(false); return; } return res.json(); })
            .then(data => { if (data) { setPet(data); setLoading(false); } })
            .catch(() => { setNotFound(true); setLoading(false); });
    }, [id]);

    useEffect(() => {
        fetch('http://localhost:5000/api/pets').then(r => r.json()).then(d => setAllPets(d)).catch(() => {});
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const handleFavorite = () => {
        if (!user) { info('Please sign in to save favorites'); return; }
        const was = isFavorite(pet.id);
        toggleFavorite(pet.id);
        was ? info(`Removed ${pet.name} from favorites`) : success(`Added ${pet.name} to favorites! ❤️`);
    };

    const handleAdopt = () => {
        if (!user) { 
            info('Please sign in to start your adoption'); 
            navigate('/login');
            return; 
        }

        if (Number(user.id) === Number(pet.ownerUserId)) {
            info('You cannot adopt your own pet listing');
            return;
        }

        // Navigate to the adoption application form
        navigate(`/adopt/${id}`);
    };

    const handleChatWithOwner = () => {
        if (!pet.ownerUserId) {
            info('This listing does not have a registered owner for direct chat yet');
            return;
        }

        if (!user) {
            info('Please sign in to chat with the pet owner');
            navigate('/login');
            return;
        }

        if (Number(user.id) === Number(pet.ownerUserId)) {
            navigate('/messages');
            return;
        }

        navigate(`/messages?petId=${pet.id}`);
    };

    const handleLogout = () => { logout(); info('Logged out successfully'); setMenuOpen(false); };

    const morePets = allPets.filter(p => String(p.id) !== String(id)).sort(() => Math.random() - 0.5).slice(0, 3);

    /* ── Loading ── */
    if (loading) return (
        <div className="min-h-dvh bg-warm-bg flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <svg className="animate-spin h-10 w-10 text-primary-500" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-warm-muted text-sm font-medium">Finding your companion…</p>
            </div>
        </div>
    );

    /* ── Not Found ── */
    if (notFound) return (
        <div className="min-h-dvh bg-warm-bg flex flex-col items-center justify-center px-6 text-center">
            <span className="text-7xl mb-6">🐾</span>
            <h1 className="font-heading text-3xl font-bold text-warm-text mb-3">Pet Not Found</h1>
            <p className="text-warm-muted max-w-sm mb-8">We couldn't find this pet. They may have already found their forever home!</p>
            <Link to="/pets" className="btn-primary px-8 py-3 text-sm"><FaArrowLeft /> Browse All Pets</Link>
        </div>
    );

    const favoured = isFavorite(pet.id);
    const emoji    = speciesEmoji(pet.breed);
    const isCat    = ['cat','persian','siamese','ragdoll','bengal','maine','scottish','birman'].some(x => pet.breed.toLowerCase().includes(x));

    return (
        <div className="min-h-dvh bg-warm-bg">

            {/* ── STICKY NAVBAR ── */}
            <header className="sticky top-0 z-40 bg-warm-bg/85 backdrop-blur-xl border-b border-warm-border">
                <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold z-[60]">
                        <FaPaw className="text-primary-600 transition-transform duration-300 hover:rotate-[-12deg]" />
                        <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">Aurelia</span>
                    </Link>

                    {menuOpen && <div className="fixed inset-0 bg-black/40 z-[55] md:hidden" onClick={() => setMenuOpen(false)} aria-hidden="true" />}

                    <nav className="hidden md:flex items-center gap-8">
                        {showAuthenticatedUi && <Link to="/dashboard" className="text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">Dashboard</Link>}
                        <Link to="/pets" className="text-sm font-medium text-primary-700 relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:to-primary-700 after:rounded-full">Adopt</Link>
                        <Link to="/how-it-works" className="text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">How It Works</Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {showAuthenticatedUi ? (
                            <>
                                <Link to="/profile" className="hidden sm:flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full pl-1 pr-4 py-1 border border-warm-border/50 hover:border-primary-200 transition-all duration-200">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold shadow-warm-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-warm-text">{user.name.split(' ')[0]}</span>
                                </Link>
                                <button onClick={handleLogout} className="hidden md:flex p-2.5 rounded-xl text-warm-faded hover:text-red-500 hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100" aria-label="Logout">
                                    <FaSignOutAlt className="text-[0.9rem]" />
                                </button>
                            </>
                        ) : showGuestUi ? (
                            <>
                                <Link to="/login" className="hidden md:inline text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">Sign In</Link>
                                <Link to="/register" className="hidden md:inline btn-primary text-sm px-6 py-2.5">Get Started</Link>
                            </>
                        ) : null}
                        <button className="flex md:hidden items-center justify-center text-warm-text z-[60] p-2 rounded-lg hover:bg-warm-border/30 transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
                            {menuOpen ? <HiX size={26} /> : <HiMenuAlt3 size={26} />}
                        </button>
                    </div>

                    {/* Mobile menu */}
                    <nav className={`md:hidden fixed top-0 right-0 w-[280px] h-dvh flex flex-col justify-center items-center bg-[#FFFDF7] z-[60] shadow-[-8px_0_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-label="Mobile navigation">
                        <div className="flex flex-col items-center gap-6 mb-8">
                            {[{to:'/',label:'Home'}, ...(showAuthenticatedUi?[{to:'/dashboard',label:'Dashboard'}]:[]), {to:'/pets',label:'Adopt'}, {to:'/how-it-works',label:'How It Works'}].map(({to,label}) => (
                                <Link key={to} to={to} onClick={() => setMenuOpen(false)} className="relative text-lg font-semibold text-warm-muted hover:text-warm-text transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:to-primary-700 after:rounded-full after:transition-all after:duration-300 hover:after:w-full">{label}</Link>
                            ))}
                        </div>
                        <div className="flex flex-col items-center gap-3 pt-6 border-t border-warm-border/40 w-[85%]">
                            {showAuthenticatedUi ? (
                                <>
                                    <span className="text-base font-semibold text-warm-text">Hi, {user.name.split(' ')[0]} 👋</span>
                                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/60 border border-warm-border/50 text-sm font-medium text-warm-text hover:border-red-200 hover:bg-red-50 hover:text-red-600 transition-all duration-200">
                                        <FaSignOutAlt /> Logout
                                    </button>
                                </>
                            ) : showGuestUi ? (
                                <>
                                    <Link to="/login" onClick={() => setMenuOpen(false)} className="w-full text-center px-8 py-3 rounded-xl bg-white/60 border border-warm-border/50 text-sm font-medium text-warm-text hover:bg-primary-50 transition-all duration-200">Sign In</Link>
                                    <Link to="/register" onClick={() => setMenuOpen(false)} className="w-full text-center btn-primary px-8 py-3 text-sm">Get Started</Link>
                                </>
                            ) : null}
                        </div>
                    </nav>
                </div>
            </header>

            <main>
                {/* ══════════════════════════════════════════════════════
                    SPLIT-SCREEN LAYOUT
                    Desktop: image column (55%, sticky) | info column (45%, scrollable)
                    Mobile:  image on top (60vw tall) → info below (stacked)

                    Design Theory applied:
                    • Visual Hierarchy  — large image is dominant; name overlaid at bottom
                    • Figure–Ground     — gradient overlay separates pet from overlay text
                    • Gestalt Proximity — info grouped in cards with generous padding
                    • Gestalt Similarity— all trait pills share identical style
                    • Hick's Law        — single primary CTA per section
                    • Fitts's Law       — large tap targets for all interactive elements
                    • White Space       — generous padding; cream bg lets cards breathe
                    • Responsive Design — graceful stack on mobile
                    • Aesthetic Appeal  — Framer Motion entry animations + glassmorphism cards
                ══════════════════════════════════════════════════════ */}
                <div className="lg:flex lg:items-start">

                    {/* ─── LEFT: Sticky image column ─── */}
                    <div className="lg:sticky lg:top-16 lg:w-[55%] lg:h-[calc(100vh-64px)] shrink-0 relative overflow-hidden h-[60vw] min-h-[280px] lg:min-h-0">
                        <motion.img
                            variants={fadeIn} initial="hidden" animate="show"
                            src={pet.image}
                            alt={`${pet.name}, a ${pet.breed} available for adoption`}
                            className="w-full h-full object-cover object-center"
                        />
                        {/* Bottom gradient — Figure–Ground */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                        {/* Back button — Fitts's Law */}
                        <motion.div initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.4 }} className="absolute top-5 left-5 z-10">
                            <button onClick={() => navigate(-1)}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-semibold hover:bg-white/35 transition-all duration-200"
                                aria-label="Go back">
                                <FaArrowLeft className="text-xs" /> Back
                            </button>
                        </motion.div>

                        {/* Age badge */}
                        <span className="absolute top-5 right-5 z-10 inline-flex items-center gap-1.5 text-xs font-semibold text-warm-text bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-warm-sm">
                            <FaClock className="text-[0.6rem]" /> {pet.age}
                        </span>

                        {/* Pet name — Visual Hierarchy: largest text element */}
                        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, delay:0.15, ease:[0.16,1,0.3,1] }} className="absolute bottom-6 left-6 z-10">
                            <span className="text-3xl leading-none block mb-1">{emoji}</span>
                            <h1 className="font-heading text-[clamp(1.8rem,3.2vw,3rem)] font-bold text-white leading-[1.1] drop-shadow-lg">{pet.name}</h1>
                            <p className="text-white/80 text-sm font-medium mt-0.5">{pet.breed}</p>
                        </motion.div>
                    </div>

                    {/* ─── RIGHT: Scrollable info column ─── */}
                    <div className="lg:w-[45%] lg:h-[calc(100vh-64px)] lg:overflow-y-auto">
                        <div className="px-6 lg:px-10 xl:px-12 py-8 lg:py-10">

                            {/* Breadcrumb */}
                            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-warm-faded mb-6">
                                <Link to="/" className="hover:text-warm-text transition-colors">Home</Link>
                                <FaChevronRight className="text-[0.5rem]" />
                                <Link to="/pets" className="hover:text-warm-text transition-colors">Browse Pets</Link>
                                <FaChevronRight className="text-[0.5rem]" />
                                <span className="text-warm-text font-semibold">{pet.name}</span>
                            </nav>

                            {/* Name + availability */}
                            <motion.div variants={fadeUp} custom={0} initial="hidden" animate="show" className="mb-6">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="font-heading text-[clamp(1.5rem,2.8vw,2.2rem)] font-bold text-warm-text leading-tight">{pet.name}</h2>
                                        <p className="text-warm-faded mt-1 text-sm">{pet.breed}</p>
                                    </div>
                                    <span className="shrink-0 inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Available
                                    </span>
                                </div>
                            </motion.div>

                            {/* About */}
                            <motion.div variants={fadeUp} custom={1} initial="hidden" animate="show"
                                className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-warm-sm p-5 mb-4">
                                <span className="section-label mb-3 inline-block">About {pet.name}</span>
                                <p className="text-warm-text leading-relaxed text-sm">{pet.description}</p>
                            </motion.div>

                            {/* Personality traits — Gestalt Similarity */}
                            <motion.div variants={fadeUp} custom={2} initial="hidden" animate="show"
                                className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-warm-sm p-5 mb-4">
                                <h3 className="font-heading text-sm font-bold text-warm-text mb-3">Personality Traits</h3>
                                <div className="flex flex-wrap gap-2">
                                    {pet.personality.map((tag, i) => (
                                        <motion.span key={tag}
                                            initial={{ opacity:0, scale:0.85 }} animate={{ opacity:1, scale:1 }}
                                            transition={{ duration:0.3, delay:0.3 + i * 0.06 }}
                                            className={`inline-flex items-center gap-1.5 text-xs font-semibold border px-3 py-1.5 rounded-full ${tagColors[i % tagColors.length]}`}>
                                            <FaStar className="text-[0.5rem] opacity-70" />{tag}
                                        </motion.span>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Quick facts — Gestalt Proximity */}
                            <motion.div variants={fadeUp} custom={3} initial="hidden" animate="show"
                                className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-warm-sm p-5 mb-4">
                                <h3 className="font-heading text-sm font-bold text-warm-text mb-3">Quick Facts</h3>
                                <ul className="grid grid-cols-2 gap-3" role="list">
                                    {[
                                        { label:'Species', value: isCat ? 'Cat' : 'Dog', icon:'🐾' },
                                        { label:'Breed',   value: pet.breed,              icon:'🏷️' },
                                        { label:'Age',     value: pet.age,                icon:'🎂' },
                                        { label:'Status',  value: 'Available',            icon:'✅' },
                                    ].map(({ label, value, icon }) => (
                                        <li key={label} className="flex flex-col gap-1 p-3 bg-warm-bg/60 rounded-xl border border-warm-border/50">
                                            <span className="text-lg leading-none">{icon}</span>
                                            <span className="text-[0.65rem] text-warm-faded font-medium uppercase tracking-wide mt-0.5">{label}</span>
                                            <span className="text-xs font-bold text-warm-text">{value}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Health checklist */}
                            <motion.div variants={fadeUp} custom={4} initial="hidden" animate="show"
                                className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60 shadow-warm-sm p-5 mb-4">
                                <h3 className="font-heading text-sm font-bold text-warm-text mb-3">Health & Safety</h3>
                                <ul className="flex flex-col gap-2.5" role="list">
                                    {['Health check completed','Vaccinations up to date','Microchipped & registered','Behavioural assessment done'].map(item => (
                                        <li key={item} className="flex items-center gap-3 text-sm text-warm-muted">
                                            <FaCheckCircle className="text-emerald-500 shrink-0" />{item}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* CTA — Hick's Law + Fitts's Law */}
                            <motion.div variants={fadeUp} custom={5} initial="hidden" animate="show" className="mb-3">
                                <motion.button
                                    onClick={handleAdopt}
                                    className="w-full flex items-center justify-center gap-2 btn-primary px-10 py-4 text-base rounded-full shadow-warm-md hover:shadow-warm-lg hover:-translate-y-0.5 transition-all duration-300"
                                    aria-label={`Start adoption process for ${pet.name}`}>
                                    <FaPaw /> Start Adoption
                                </motion.button>
                            </motion.div>

                            {/* Direct chat with owner */}
                            <motion.div variants={fadeUp} custom={6} initial="hidden" animate="show" className="mb-3">
                                <button
                                    onClick={handleChatWithOwner}
                                    className="w-full flex items-center justify-center gap-2 px-10 py-3.5 rounded-full text-sm font-semibold border border-primary-300 text-primary-700 bg-primary-50 hover:bg-primary-100 transition-all duration-300"
                                    aria-label={Number(user?.id) === Number(pet.ownerUserId) ? 'Open messages' : `Chat with ${pet.ownerName || 'owner'}`}
                                >
                                    <FaComments />
                                    {Number(user?.id) === Number(pet.ownerUserId)
                                        ? 'View Incoming Chats'
                                        : `Chat With ${pet.ownerName || 'Owner'}`}
                                </button>
                                {!pet.ownerUserId && (
                                    <p className="text-center text-xs text-warm-faded mt-2">Owner chat is currently unavailable for this listing.</p>
                                )}
                            </motion.div>

                            {/* Favourite */}
                            <motion.div variants={fadeUp} custom={7} initial="hidden" animate="show" className="mb-5">
                                <button onClick={handleFavorite}
                                    className={`w-full flex items-center justify-center gap-2 px-10 py-3.5 rounded-full text-sm font-semibold border transition-all duration-300 hover:-translate-y-0.5
                                        ${favoured ? 'bg-red-50 text-red-500 border-red-300 hover:bg-red-100' : 'bg-warm-bg text-warm-muted border-warm-border hover:text-red-500 hover:border-red-300 hover:bg-red-50'}`}
                                    aria-label={favoured ? `Remove ${pet.name} from favorites` : `Save ${pet.name} to favorites`}>
                                    <FaHeart className={favoured ? 'animate-pulse' : ''} />
                                    {favoured ? 'Saved to Favorites' : 'Save to Favorites'}
                                </button>
                                {showGuestUi && (
                                    <p className="text-center text-xs text-warm-faded mt-3">
                                        <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link> to save favourites & track applications.
                                    </p>
                                )}
                            </motion.div>

                            {/* How It Works nudge */}
                            <motion.div variants={fadeUp} custom={8} initial="hidden" animate="show"
                                className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50 shadow-warm-sm flex items-start gap-3 mb-10">
                                <FaDog className="text-primary-500 text-lg mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-warm-text">First time adopting?</p>
                                    <p className="text-xs text-warm-muted leading-relaxed mt-0.5">
                                        Our process is simple and transparent.{' '}
                                        <Link to="/how-it-works" className="text-primary-600 font-semibold hover:underline">How It Works →</Link>
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* ── MORE PETS STRIP — full-width below split ── */}
                {morePets.length > 0 && (
                    <section className="bg-gradient-to-br from-primary-50/60 via-[#FFF8E1]/40 to-warm-bg py-16">
                        <div className="max-w-[1280px] mx-auto px-6">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <span className="section-label mb-2 inline-block">You Might Also Love</span>
                                    <h2 className="font-heading text-2xl font-bold text-warm-text">More Adorable Pets</h2>
                                </div>
                                <Link to="/pets" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800 transition-colors group">
                                    View All <FaChevronRight className="text-xs group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                {morePets.map((p, i) => (
                                    <motion.div key={p.id} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.45, delay:i*0.1, ease:[0.16,1,0.3,1] }}>
                                        <Link to={`/pets/${p.id}`}
                                            className="group block bg-white/70 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/60 shadow-warm-sm hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(45,34,25,0.12),0_0_40px_rgba(255,193,7,0.2)] hover:border-primary-200 transition-all duration-300">
                                            <div className="relative h-48 overflow-hidden">
                                                <img src={p.image} alt={`${p.name}, a ${p.breed}`}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]" loading="lazy" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                                    <span className="text-white text-xs font-semibold bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full">Meet {p.name} →</span>
                                                </div>
                                                <span className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 text-xs font-semibold text-warm-text bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full shadow-warm-sm">
                                                    <FaClock className="text-[0.55rem]" /> {p.age}
                                                </span>
                                            </div>
                                            <div className="p-4">
                                                <p className="font-heading text-base font-bold text-warm-text">{p.name}</p>
                                                <p className="text-xs text-warm-faded mt-0.5">{p.breed}</p>
                                                <div className="flex flex-wrap gap-1 mt-2.5">
                                                    {p.personality.slice(0,2).map(tag => (
                                                        <span key={tag} className="text-xs font-medium text-primary-800 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">{tag}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="text-center mt-8 sm:hidden">
                                <Link to="/pets" className="btn-primary px-8 py-3 text-sm">View All Pets</Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
