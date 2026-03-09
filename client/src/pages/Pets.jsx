import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPaw, FaClock, FaHeart, FaSearch, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function Pets() {
    const { user, logout } = useAuth();
    const [pets, setPets] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/pets')
            .then((res) => res.json())
            .then((data) => { setPets(data); setLoading(false); })
            .catch((err) => { console.error(err); setLoading(false); });
    }, []);

    const filtered = pets.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.breed.toLowerCase().includes(search.toLowerCase()) ||
        p.personality.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="min-h-dvh bg-warm-bg">
            {/* Top bar */}
            <header className="sticky top-0 z-40 bg-warm-bg/85 backdrop-blur-xl border-b border-warm-border">
                <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
                        <FaPaw className="text-primary-600" />
                        <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                            Aurelia
                        </span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-8">
                        {user && (
                            <Link to="/dashboard" className="text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">
                                Dashboard
                            </Link>
                        )}
                        <span className="text-sm font-medium text-primary-700 relative
                            after:content-[''] after:absolute after:bottom-[-4px] after:left-0
                            after:w-full after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:to-primary-700
                            after:rounded-full">
                            Adopt
                        </span>
                        <Link to="/how-it-works" className="text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">
                            How It Works
                        </Link>
                    </nav>

                    <div className="flex items-center gap-3">
                        {user ? (
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
                </div>
            </header>

            {/* Hero banner */}
            <section className="relative bg-gradient-to-br from-primary-50 via-[#FFF8E1] to-warm-bg py-16 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-[20%] -right-[10%] w-[400px] h-[400px] rounded-full
            bg-[radial-gradient(circle,_#FFE08240,_transparent_70%)] blur-[80px] opacity-50" />
                </div>

                <div className="max-w-[1280px] mx-auto px-6 relative z-10">
                    <motion.div
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="section-label">🐾 Browse & Adopt</span>
                        <h1 className="font-heading text-section font-bold mt-3 mb-3">
                            Find Your Perfect Companion
                        </h1>
                        <p className="text-warm-muted max-w-[500px] mx-auto">
                            {user ? `Welcome back, ${user.name.split(' ')[0]}! ` : ''}
                            Browse all our lovable pets waiting for their forever home.
                        </p>
                    </motion.div>

                    {/* Search */}
                    <motion.div
                        className="max-w-md mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by name, breed, or personality..."
                                className="w-full pl-11 pr-4 py-3.5 rounded-full bg-white/80 backdrop-blur-md
                  border border-warm-border text-warm-text text-sm
                  placeholder:text-warm-faded shadow-warm-sm
                  focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                  transition-all duration-200"
                            />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Pet Grid */}
            <section className="max-w-[1280px] mx-auto px-6 py-12">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20">
                        <span className="text-5xl block mb-4">🔍</span>
                        <h3 className="font-heading text-xl font-bold text-warm-text mb-2">No pets found</h3>
                        <p className="text-warm-muted text-sm">Try a different search term</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-warm-faded mb-6">
                            Showing <strong className="text-warm-text">{filtered.length}</strong> pet{filtered.length !== 1 && 's'}
                            {search && <> matching "<strong className="text-warm-text">{search}</strong>"</>}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filtered.map((pet, i) => (
                                <motion.article
                                    key={pet.id}
                                    className="group bg-warm-surface rounded-2xl overflow-hidden
                    shadow-warm-sm border border-warm-border
                    transition-all duration-300 ease-out
                    hover:-translate-y-1.5 hover:shadow-[0_8px_30px_rgba(45,34,25,0.12),0_0_40px_rgba(255,193,7,0.25)]
                    hover:border-primary-200"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-50px' }}
                                    transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {/* Image */}
                                    <div className="relative h-[280px] overflow-hidden">
                                        <img
                                            src={pet.image}
                                            alt={`${pet.name}, a ${pet.breed} available for adoption`}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out
                        group-hover:scale-[1.06]"
                                            loading="lazy"
                                        />

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                      flex items-end justify-center pb-8
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <button
                                                className="btn-primary text-sm px-6 py-2.5
                          translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                                                aria-label={`Adopt ${pet.name}`}
                                            >
                                                <FaPaw /> Adopt {pet.name}
                                            </button>
                                        </div>

                                        {/* Age badge */}
                                        <span className="absolute top-3 right-3 inline-flex items-center gap-1
                      text-xs font-semibold text-warm-text bg-white/90 backdrop-blur-md
                      px-3 py-1 rounded-full shadow-warm-sm">
                                            <FaClock className="text-[0.65rem]" /> {pet.age}
                                        </span>
                                    </div>

                                    {/* Body */}
                                    <div className="p-5 relative">
                                        <div className="mb-2">
                                            <h3 className="font-heading text-lg font-bold text-warm-text">{pet.name}</h3>
                                            <span className="text-sm text-warm-faded">{pet.breed}</span>
                                        </div>

                                        <p className="text-sm text-warm-muted leading-relaxed mb-3">{pet.description}</p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {pet.personality.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-xs font-medium text-primary-800 bg-primary-50
                            border border-primary-100 px-2.5 py-0.5 rounded-full"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Heart */}
                                        <button
                                            className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center
                        rounded-full bg-primary-50 text-warm-faded text-sm
                        border border-warm-border
                        hover:text-red-400 hover:bg-red-50 hover:border-red-400
                        hover:scale-110 transition-all duration-200"
                                            aria-label={`Save ${pet.name} to favorites`}
                                        >
                                            <FaHeart />
                                        </button>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}
