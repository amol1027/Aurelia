import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPaw, FaClock, FaHeart, FaSearch, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNotification } from '../context/NotificationContext';

export default function Pets() {
    const { user, loading: authLoading, isAuthenticated, logout } = useAuth();
    const { toggleFavorite, isFavorite } = useFavorites();
    const { success, info } = useNotification();
    const [pets, setPets] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [menuOpen, setMenuOpen] = useState(false);
    const showAuthenticatedUi = !authLoading && isAuthenticated;
    const showGuestUi = !authLoading && !isAuthenticated;

    useEffect(() => {
        fetch('http://localhost:5000/api/pets')
            .then((res) => res.json())
            .then((data) => { setPets(data); setLoading(false); })
            .catch((err) => { console.error(err); setLoading(false); });
    }, []);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const filtered = pets.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.breed.toLowerCase().includes(search.toLowerCase()) ||
        p.personality.some((t) => t.toLowerCase().includes(search.toLowerCase()))
    );

    const handleToggleFavorite = (petId, petName) => {
        if (!user) {
            info('Please sign in to save favorites');
            return;
        }
        
        const wasFavorite = isFavorite(petId);
        toggleFavorite(petId);
        
        if (wasFavorite) {
            info(`Removed ${petName} from favorites`);
        } else {
            success(`Added ${petName} to favorites! ❤️`);
        }
    };

    const handleLogout = () => {
        logout();
        info('You have been logged out successfully');
        setMenuOpen(false);
    };

    return (
        <div className="min-h-dvh bg-warm-bg">
            {/* Top bar */}
            <header className="sticky top-0 z-40 bg-warm-bg/85 backdrop-blur-xl border-b border-warm-border">
                <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold z-[60]">
                        <FaPaw className="text-primary-600" />
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

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {showAuthenticatedUi && (
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

                    {/* Mobile Menu */}
                    <nav
                        className={`md:hidden fixed top-0 right-0 w-[280px] h-dvh
                            flex flex-col justify-center items-center
                            bg-[#FFFDF7] z-[60]
                            shadow-[-8px_0_30px_rgba(0,0,0,0.15)]
                            transition-transform duration-300 ease-out
                            ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                        aria-label="Mobile navigation"
                    >
                        <div className="flex flex-col items-center gap-6 mb-8">
                            {/* Navigation Links */}
                            <Link 
                                to="/" 
                                onClick={() => setMenuOpen(false)}
                                className="relative text-lg font-semibold text-warm-muted hover:text-warm-text 
                                    transition-colors duration-200
                                    after:content-[''] after:absolute after:bottom-[-2px] after:left-0
                                    after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:to-primary-700
                                    after:rounded-full after:transition-all after:duration-300
                                    hover:after:w-full">
                                Home
                            </Link>
                            {showAuthenticatedUi && (
                                <Link 
                                    to="/dashboard" 
                                    onClick={() => setMenuOpen(false)}
                                    className="relative text-lg font-semibold text-warm-muted hover:text-warm-text 
                                        transition-colors duration-200
                                        after:content-[''] after:absolute after:bottom-[-2px] after:left-0
                                        after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:to-primary-700
                                        after:rounded-full after:transition-all after:duration-300
                                        hover:after:w-full">
                                    Dashboard
                                </Link>
                            )}
                            <span className="relative text-lg font-semibold text-primary-700
                                after:content-[''] after:absolute after:bottom-[-2px] after:left-0
                                after:w-full after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:to-primary-700
                                after:rounded-full">
                                Adopt
                            </span>
                            <Link 
                                to="/how-it-works" 
                                onClick={() => setMenuOpen(false)}
                                className="relative text-lg font-semibold text-warm-muted hover:text-warm-text 
                                    transition-colors duration-200
                                    after:content-[''] after:absolute after:bottom-[-2px] after:left-0
                                    after:w-0 after:h-[2px] after:bg-gradient-to-r after:from-primary-500 after:to-primary-700
                                    after:rounded-full after:transition-all after:duration-300
                                    hover:after:w-full">
                                How It Works
                            </Link>
                        </div>

                        {/* Mobile Auth Section */}
                        <div className="flex flex-col items-center gap-3 pt-6 border-t border-warm-border/40 w-[85%]">
                            {showAuthenticatedUi ? (
                                <>
                                    <div className="flex flex-col items-center gap-2 mb-3">
                                        <span className="text-base font-semibold text-warm-text">
                                            Hi, {user.name.split(' ')[0]} 👋
                                        </span>
                                        <span className="text-xs text-warm-faded capitalize px-3 py-1 bg-primary-50 rounded-full border border-primary-100">
                                            {user.role}
                                        </span>
                                    </div>
                                    <Link 
                                        to="/favorites" 
                                        onClick={() => setMenuOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                                            bg-white/60 backdrop-blur-md border border-warm-border/50
                                            text-sm font-medium text-warm-text
                                            hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700
                                            transition-all duration-200 shadow-warm-xs"
                                    >
                                        <FaHeart className="text-base" /> My Favorites
                                    </Link>
                                    <Link 
                                        to="/profile" 
                                        onClick={() => setMenuOpen(false)}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                                            bg-white/60 backdrop-blur-md border border-warm-border/50
                                            text-sm font-medium text-warm-text
                                            hover:border-primary-200 hover:bg-primary-50 hover:text-primary-700
                                            transition-all duration-200 shadow-warm-xs"
                                    >
                                        <FaUserCircle className="text-base" /> My Profile
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center gap-2 mt-2 px-6 py-3 rounded-xl
                                            bg-white/60 backdrop-blur-md border border-warm-border/50
                                            text-sm font-medium text-warm-text
                                            hover:border-red-200 hover:bg-red-50 hover:text-red-600
                                            transition-all duration-200 shadow-warm-xs"
                                    >
                                        <FaSignOutAlt className="text-base" /> Logout
                                    </button>
                                </>
                            ) : showGuestUi ? (
                                <>
                                    <Link 
                                        to="/login" 
                                        onClick={() => setMenuOpen(false)}
                                        className="w-full text-center px-8 py-3 rounded-xl
                                            bg-white/60 backdrop-blur-md border border-warm-border/50
                                            text-sm font-medium text-warm-text
                                            hover:border-primary-200 hover:bg-primary-50
                                            transition-all duration-200 shadow-warm-xs"
                                    >
                                        Sign In
                                    </Link>
                                    <Link 
                                        to="/register" 
                                        onClick={() => setMenuOpen(false)}
                                        className="w-full text-center btn-primary px-8 py-3 text-sm"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            ) : null}
                        </div>
                    </nav>

                    {/* Desktop Auth + Mobile Toggle */}
                    <div className="flex items-center gap-3">
                        {showAuthenticatedUi ? (
                            <>
                                <Link to="/profile"
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
                                    onClick={handleLogout}
                                    className="hidden md:flex p-2.5 rounded-xl text-warm-faded hover:text-red-500
                                        hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100"
                                    aria-label="Logout"
                                >
                                    <FaSignOutAlt className="text-[0.9rem]" />
                                </button>
                            </>
                        ) : showGuestUi ? (
                            <>
                                <Link to="/login" className="hidden md:inline text-sm font-medium text-warm-muted hover:text-warm-text transition-colors">
                                    Sign In
                                </Link>
                                <Link to="/register" className="hidden md:inline btn-primary text-sm px-6 py-2.5">
                                    Get Started
                                </Link>
                            </>
                        ) : null}

                        {/* Mobile Toggle Button */}
                        <button
                            className="flex md:hidden items-center justify-center text-warm-text z-[60] 
                                p-2 rounded-lg hover:bg-warm-border/30 transition-colors"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <HiX size={26} /> : <HiMenuAlt3 size={26} />}
                        </button>
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
                            {showAuthenticatedUi ? `Welcome back, ${user.name.split(' ')[0]}! ` : ''}
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
                                        <Link to={`/pets/${pet.id}`} className="block h-full" tabIndex={-1} aria-hidden="true">
                                        <img
                                            src={pet.image}
                                            alt={`${pet.name}, a ${pet.breed} available for adoption`}
                                            className="w-full h-full object-cover transition-transform duration-500 ease-out
                        group-hover:scale-[1.06]"
                                            loading="lazy"
                                        />
                                        </Link>

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
                      flex items-end justify-center pb-8
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                            <Link
                                                to={`/pets/${pet.id}`}
                                                className="btn-primary text-sm px-6 py-2.5 pointer-events-auto
                          translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
                                                aria-label={`Adopt ${pet.name}`}
                                            >
                                                <FaPaw /> Adopt {pet.name}
                                            </Link>
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
                                            onClick={() => handleToggleFavorite(pet.id, pet.name)}
                                            className={`absolute top-5 right-5 w-9 h-9 flex items-center justify-center
                        rounded-full text-sm border transition-all duration-200
                        ${isFavorite(pet.id)
                                                ? 'bg-red-50 text-red-500 border-red-400 hover:bg-red-100'
                                                : 'bg-primary-50 text-warm-faded border-warm-border hover:text-red-400 hover:bg-red-50 hover:border-red-400'
                                            }
                        hover:scale-110`}
                                            aria-label={isFavorite(pet.id) ? `Remove ${pet.name} from favorites` : `Save ${pet.name} to favorites`}
                                        >
                                            <FaHeart className={isFavorite(pet.id) ? 'animate-pulse' : ''} />
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
