import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaPaw, FaSearch, FaFileAlt, FaHome, FaArrowLeft, FaArrowRight,
    FaCheckCircle, FaShieldAlt, FaHeart, FaClock, FaChevronDown,
    FaChevronUp, FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

/* ── Animation ────────────────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
    }),
};

/* ── Steps data ───────────────────────────────────────────── */
const steps = [
    {
        number: '01',
        icon: FaSearch,
        title: 'Browse & Discover',
        color: 'from-primary-400 to-primary-600',
        summary: 'Explore our gallery of lovable pets. Filter by species, breed, age, or personality to find your perfect match.',
        details: [
            'Browse all available pets with photos and personality profiles',
            'Use search and filters to narrow down your ideal companion',
            'Save your favorites to revisit them later',
            'Read each pet\'s unique story and background',
        ],
    },
    {
        number: '02',
        icon: FaFileAlt,
        title: 'Apply Online',
        color: 'from-amber-400 to-orange-500',
        summary: 'Fill out a simple adoption application. Our team reviews it within 24 hours and schedules a meet-and-greet.',
        details: [
            'Complete a short, user-friendly application form',
            'Provide information about your home and lifestyle',
            'Our team reviews and responds within 24 hours',
            'A meet-and-greet session is arranged at your convenience',
        ],
    },
    {
        number: '03',
        icon: FaHome,
        title: 'Welcome Home',
        color: 'from-emerald-400 to-emerald-600',
        summary: 'After a successful meeting, bring your new family member home. We provide a starter kit and ongoing support.',
        details: [
            'Finalize the adoption paperwork with our guidance',
            'Receive a free starter kit with essentials for your pet',
            'Get access to our community of adopters and vet partners',
            'Ongoing support and advice whenever you need it',
        ],
    },
];

/* ── FAQ data ─────────────────────────────────────────────── */
const faqs = [
    {
        q: 'How long does the adoption process take?',
        a: 'The typical process takes 3–7 days from application to welcome home. We review applications within 24 hours and schedule meet-and-greets at your earliest convenience.',
    },
    {
        q: 'What are the adoption fees?',
        a: 'Adoption fees vary by pet and cover vaccinations, spay/neuter, and microchipping. All fees are listed on each pet\'s profile. We believe in transparent pricing with no hidden costs.',
    },
    {
        q: 'Can I adopt if I live in an apartment?',
        a: 'Absolutely! Many of our pets thrive in apartments. Our team will help you find a pet suited to your living space and lifestyle, whether it\'s a cozy cat or a small-breed dog.',
    },
    {
        q: 'What if the pet doesn\'t fit my home?',
        a: 'We offer a 30-day adjustment period. If things don\'t work out, you can return the pet with no questions asked. We\'ll work together to find a better match for both of you.',
    },
    {
        q: 'Do you offer post-adoption support?',
        a: 'Yes! Every adopter gets access to our support network, including vet partners, behavioral training resources, and our community forum of fellow pet parents.',
    },
];

/* ── Promises/trust badges ────────────────────────────────── */
const promises = [
    { icon: FaShieldAlt, title: 'Verified Shelters', desc: 'Every shelter is vetted and approved', color: 'from-blue-400 to-blue-600' },
    { icon: FaCheckCircle, title: 'Health Guaranteed', desc: 'All pets are vaccinated & checked', color: 'from-emerald-400 to-emerald-600' },
    { icon: FaHeart, title: 'Lifetime Support', desc: 'We\'re here for you, always', color: 'from-rose-400 to-red-500' },
    { icon: FaClock, title: '24h Response', desc: 'Applications reviewed in one day', color: 'from-amber-400 to-orange-500' },
];

/* ── FAQ Item component ───────────────────────────────────── */
function FAQItem({ faq, index }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            custom={index + 6}
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="border-b border-warm-border/60 last:border-b-0"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between py-5 px-1 text-left
                    group transition-colors duration-200"
                aria-expanded={open}
            >
                <span className="font-heading text-base font-bold text-warm-text pr-4
                    group-hover:text-primary-700 transition-colors duration-200">
                    {faq.q}
                </span>
                <span className="shrink-0 w-8 h-8 rounded-full bg-primary-50 border border-primary-100
                    flex items-center justify-center text-primary-600 text-xs
                    group-hover:bg-primary-100 transition-all duration-200">
                    {open ? <FaChevronUp /> : <FaChevronDown />}
                </span>
            </button>
            <motion.div
                initial={false}
                animate={{
                    height: open ? 'auto' : 0,
                    opacity: open ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
            >
                <p className="text-sm text-warm-muted leading-relaxed pb-5 px-1 max-w-2xl">
                    {faq.a}
                </p>
            </motion.div>
        </motion.div>
    );
}

/* ── Page ──────────────────────────────────────────────────── */
export default function HowItWorksPage() {
    const { user, loading, isAuthenticated, logout } = useAuth();
    const showAuthenticatedUi = !loading && isAuthenticated;
    const showGuestUi = !loading && !isAuthenticated;

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

                    <nav className="hidden md:flex items-center gap-8">
                        {showAuthenticatedUi && (
                            <Link to="/dashboard" className="text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">
                                Dashboard
                            </Link>
                        )}
                        <Link to="/pets" className="text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">
                            Adopt
                        </Link>
                        <span className="text-sm font-medium text-primary-700 relative
                            after:content-[''] after:absolute after:bottom-[-4px] after:left-0
                            after:w-full after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:to-primary-700
                            after:rounded-full">
                            How It Works
                        </span>
                    </nav>

                    <div className="flex items-center gap-3">
                        {showAuthenticatedUi ? (
                            <>
                                <Link to="/dashboard"
                                    className="hidden sm:flex items-center gap-2 bg-white/60 backdrop-blur-md
                                        rounded-full pl-1 pr-4 py-1 border border-warm-border/50
                                        hover:border-primary-200 transition-all duration-200">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                                        flex items-center justify-center text-white text-xs font-bold shadow-warm-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-semibold text-warm-text">{user.name.split(' ')[0]}</span>
                                </Link>
                                <button
                                    onClick={logout}
                                    className="p-2.5 rounded-xl text-warm-faded hover:text-red-500
                                        hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100"
                                    aria-label="Logout"
                                >
                                    <FaSignOutAlt className="text-[0.9rem]" />
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
                </div>
            </header>

            <main className="relative">
                {/* ─── Background orbs ─── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                    <div className="absolute -top-[120px] right-[10%] w-[500px] h-[500px] rounded-full
                        bg-[radial-gradient(circle,_#FFE08225,_transparent_70%)] blur-[100px]" />
                    <div className="absolute top-[60%] -left-[8%] w-[400px] h-[400px] rounded-full
                        bg-[radial-gradient(circle,_#FFE0B220,_transparent_70%)] blur-[100px]" />
                </div>

                {/* ═══════════════════════════════════════════
                     SECTION 1 — Hero banner
                   ═══════════════════════════════════════════ */}
                <section className="pt-14 pb-12 md:pt-20 md:pb-16">
                    <div className="max-w-[1320px] mx-auto px-6">
                        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="show" className="text-center max-w-2xl mx-auto">
                            {/* Breadcrumb */}
                            <div className="flex items-center justify-center gap-2 text-sm text-warm-faded mb-6">
                                <Link to={showAuthenticatedUi ? '/dashboard' : '/'} className="hover:text-warm-text transition-colors flex items-center gap-1">
                                    <FaArrowLeft className="text-xs" /> {showAuthenticatedUi ? 'Dashboard' : 'Home'}
                                </Link>
                                <span>/</span>
                                <span className="text-warm-text font-medium">How It Works</span>
                            </div>

                            <span className="section-label">📖 Adoption Guide</span>
                            <h1 className="font-heading text-[clamp(2rem,5vw,3.5rem)] font-bold mt-3 mb-4 leading-[1.1]">
                                Three Simple Steps to{' '}
                                <span className="bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                    Happiness
                                </span>
                            </h1>
                            <p className="text-warm-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
                                Our streamlined adoption process makes finding your perfect companion effortless and joyful.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                     SECTION 2 — Steps (detailed cards)
                   ═══════════════════════════════════════════ */}
                <section className="pb-20">
                    <div className="max-w-[1320px] mx-auto px-6">
                        <div className="space-y-6">
                            {steps.map((step, i) => {
                                const Icon = step.icon;
                                const isEven = i % 2 === 1;

                                return (
                                    <motion.div
                                        key={step.number}
                                        custom={i + 1}
                                        variants={fadeUp}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true, margin: '-60px' }}
                                        className={`relative flex flex-col ${isEven ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 items-center`}
                                    >
                                        {/* Number side — large number decorative */}
                                        <div className="w-full md:w-5/12 flex justify-center">
                                            <div className="relative">
                                                {/* Large background number */}
                                                <span className="font-heading text-[8rem] md:text-[11rem] font-bold leading-none
                                                    bg-gradient-to-b from-primary-100 to-transparent bg-clip-text text-transparent
                                                    select-none">
                                                    {step.number}
                                                </span>
                                                {/* Icon circle on top */}
                                                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                                    w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color}
                                                    flex items-center justify-center text-white text-2xl
                                                    shadow-warm-lg rotate-3 hover:rotate-0
                                                    transition-all duration-300 hover:scale-110 hover:shadow-glow`}>
                                                    <Icon />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content side */}
                                        <div className="w-full md:w-7/12">
                                            <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60
                                                p-8 md:p-10 shadow-warm-sm hover:shadow-warm-md transition-all duration-300">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest
                                                    px-3 py-1 rounded-full mb-4 bg-gradient-to-r ${step.color} text-white`}>
                                                    Step {step.number}
                                                </span>
                                                <h3 className="font-heading text-2xl font-bold text-warm-text mb-3">
                                                    {step.title}
                                                </h3>
                                                <p className="text-warm-muted text-[0.95rem] leading-relaxed mb-6">
                                                    {step.summary}
                                                </p>

                                                {/* Bullet points */}
                                                <ul className="space-y-3">
                                                    {step.details.map((d, j) => (
                                                        <li key={j} className="flex items-start gap-3 text-sm text-warm-muted">
                                                            <FaCheckCircle className={`shrink-0 mt-0.5 text-transparent bg-gradient-to-r ${step.color} bg-clip-text`}
                                                                style={{
                                                                    color: i === 0 ? '#FFC107' : i === 1 ? '#F59E0B' : '#10B981'
                                                                }} />
                                                            <span>{d}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                     SECTION 3 — Trust badges / promises
                   ═══════════════════════════════════════════ */}
                <section className="py-16 bg-gradient-to-b from-primary-50/50 to-warm-bg">
                    <div className="max-w-[1320px] mx-auto px-6">
                        <motion.div custom={4} variants={fadeUp} initial="hidden" whileInView="show"
                            viewport={{ once: true, margin: '-40px' }}
                            className="text-center mb-12">
                            <span className="section-label">✨ Our Promise</span>
                            <h2 className="font-heading text-section font-bold mt-3">Why Adopt With Aurelia?</h2>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {promises.map((p, i) => {
                                const Icon = p.icon;
                                return (
                                    <motion.div
                                        key={p.title}
                                        custom={5 + i}
                                        variants={fadeUp}
                                        initial="hidden"
                                        whileInView="show"
                                        viewport={{ once: true, margin: '-40px' }}
                                        className="group bg-white/70 backdrop-blur-xl rounded-2xl border border-white/60
                                            p-6 text-center shadow-warm-sm
                                            hover:-translate-y-1 hover:shadow-warm-md
                                            transition-all duration-300"
                                    >
                                        <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${p.color}
                                            flex items-center justify-center text-white text-xl
                                            shadow-warm-sm mb-4 group-hover:scale-110 group-hover:shadow-glow
                                            transition-all duration-300`}>
                                            <Icon />
                                        </div>
                                        <h3 className="font-heading text-base font-bold text-warm-text mb-1">{p.title}</h3>
                                        <p className="text-xs text-warm-muted">{p.desc}</p>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                     SECTION 4 — FAQ
                   ═══════════════════════════════════════════ */}
                <section className="py-20">
                    <div className="max-w-[800px] mx-auto px-6">
                        <motion.div custom={5} variants={fadeUp} initial="hidden" whileInView="show"
                            viewport={{ once: true, margin: '-40px' }}
                            className="text-center mb-12">
                            <span className="section-label">❓ FAQ</span>
                            <h2 className="font-heading text-section font-bold mt-3">Frequently Asked Questions</h2>
                            <p className="text-warm-muted mt-2 max-w-lg mx-auto">
                                Everything you need to know about adopting through Aurelia.
                            </p>
                        </motion.div>

                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/60
                            px-8 py-2 shadow-warm-sm">
                            {faqs.map((faq, i) => (
                                <FAQItem key={i} faq={faq} index={i} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ═══════════════════════════════════════════
                     SECTION 5 — CTA
                   ═══════════════════════════════════════════ */}
                <section className="pb-20">
                    <div className="max-w-[1320px] mx-auto px-6">
                        <motion.div
                            custom={10}
                            variants={fadeUp}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true, margin: '-40px' }}
                            className="relative overflow-hidden rounded-3xl
                                bg-gradient-to-r from-accent-800 via-accent-700 to-accent-600
                                p-10 md:p-14 text-center shadow-warm-xl"
                        >
                            {/* Watermark */}
                            <div className="absolute -right-8 -bottom-8 text-white/[0.04] text-[12rem] pointer-events-none">
                                <FaPaw />
                            </div>
                            <div className="absolute left-8 top-6 text-white/[0.03] text-[6rem] rotate-[-15deg] pointer-events-none">
                                <FaPaw />
                            </div>

                            <div className="relative z-10 max-w-lg mx-auto">
                                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
                                    Ready to Find Your Companion?
                                </h2>
                                <p className="text-white/60 text-sm md:text-base mb-8">
                                    Start browsing our adorable pets and take the first step towards a heartwarming adoption story.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link to="/pets"
                                        className="inline-flex items-center gap-2 font-semibold text-sm
                                            bg-gradient-to-br from-primary-400 to-primary-600 text-warm-dark
                                            px-8 py-3.5 rounded-full shadow-warm-md
                                            hover:shadow-warm-lg hover:-translate-y-0.5
                                            transition-all duration-300">
                                        <FaPaw /> Browse Pets <FaArrowRight className="text-xs" />
                                    </Link>
                                    {showGuestUi && (
                                        <Link to="/register"
                                            className="inline-flex items-center gap-2 font-semibold text-sm
                                                bg-white/15 backdrop-blur-sm text-white border border-white/30
                                                px-8 py-3.5 rounded-full
                                                hover:bg-white/25 hover:-translate-y-0.5
                                                transition-all duration-300">
                                            Create Account
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </main>

            {/* ─── Footer credit ─── */}
            <footer className="border-t border-warm-border/60 py-6">
                <div className="max-w-[1320px] mx-auto px-6 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-1.5 text-sm text-warm-faded hover:text-warm-text transition-colors">
                        <FaPaw className="text-primary-500 text-xs" /> Aurelia
                    </Link>
                    <p className="text-xs text-warm-faded">© {new Date().getFullYear()} Aurelia. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
