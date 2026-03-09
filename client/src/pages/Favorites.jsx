import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPaw, FaClock, FaHeart, FaArrowLeft, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNotification } from '../context/NotificationContext';

export default function Favorites() {
    const { user, loading: authLoading, logout } = useAuth();
    const { favorites, toggleFavorite, isFavorite } = useFavorites();
    const { success, info } = useNotification();
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:5000/api/pets')
            .then((res) => res.json())
            .then((data) => {
                setPets(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (authLoading) return null;
    if (!user) return <Navigate to="/login" replace />;

    const favoritePets = pets.filter((pet) => favorites.includes(pet.id));

    const handleToggleFavorite = (petId, petName) => {
        const wasFavorite = isFavorite(petId);
        toggleFavorite(petId);

        if (wasFavorite) {
            info(`Removed ${petName} from favorites`);
        } else {
            success(`Added ${petName} to favorites! ❤️`);
        }
    };

    return (
        <div className="min-h-dvh bg-gradient-to-br from-warm-bg via-primary-50 to-[#FFF5E0] relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full
                    bg-[radial-gradient(circle,_#FFE08220,_transparent_70%)] blur-[100px]" />
                <div className="absolute bottom-[15%] left-[5%] w-[400px] h-[400px] rounded-full
                    bg-[radial-gradient(circle,_#FFE0B215,_transparent_70%)] blur-[100px]" />
            </div>

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-2xl border-b border-warm-border/60">
                <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/dashboard" className="flex items-center gap-2 text-warm-muted hover:text-warm-text transition-colors">
                            <FaArrowLeft className="text-sm" />
                            <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
                            <FaPaw className="text-primary-600" />
                            <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                                Aurelia
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-3">
                        {user && (
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
                                    onClick={logout}
                                    className="p-2.5 rounded-xl text-warm-faded hover:text-red-500
                                        hover:bg-red-50 transition-all duration-200 border border-transparent hover:border-red-100"
                                    aria-label="Logout"
                                >
                                    <FaSignOutAlt className="text-[0.9rem]" />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative z-10 max-w-[1280px] mx-auto px-6 py-12">
                {/* Page Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full
                        border border-red-100 text-sm font-semibold mb-4">
                        <FaHeart className="animate-pulse" />
                        <span>{favorites.length} Saved</span>
                    </div>
                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-warm-text mb-3">
                        My Favorites
                    </h1>
                    <p className="text-warm-muted text-base max-w-[500px] mx-auto">
                        Your saved pets — revisit them anytime and take the next step when you're ready.
                    </p>
                </motion.div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : favoritePets.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="max-w-md mx-auto text-center py-20"
                    >
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-warm-xl border border-white/60 p-10">
                            <span className="text-6xl block mb-4">💔</span>
                            <h3 className="font-heading text-2xl font-bold text-warm-text mb-3">
                                No Favorites Yet
                            </h3>
                            <p className="text-warm-muted mb-6 leading-relaxed">
                                Start browsing our adorable pets and save your favorites by clicking the heart icon.
                            </p>
                            <Link to="/pets" className="btn-primary inline-flex items-center gap-2">
                                <FaPaw /> Browse Pets
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {favoritePets.map((pet, i) => (
                            <motion.article
                                key={pet.id}
                                className="group bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden
                                    shadow-warm-xl border border-white/60
                                    transition-all duration-300 ease-out
                                    hover:-translate-y-1.5 hover:shadow-[0_12px_40px_rgba(45,34,25,0.15),0_0_50px_rgba(255,193,7,0.3)]
                                    hover:border-primary-200"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
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

                                    {/* Heart - Always filled for favorites */}
                                    <button
                                        onClick={() => handleToggleFavorite(pet.id, pet.name)}
                                        className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center
                                            rounded-full bg-red-50 text-red-500 border border-red-400
                                            hover:bg-red-100 hover:scale-110 transition-all duration-200"
                                        aria-label={`Remove ${pet.name} from favorites`}
                                    >
                                        <FaHeart className="animate-pulse" />
                                    </button>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}

                {/* Call to action */}
                {favoritePets.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="mt-16 text-center"
                    >
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-warm-xl border border-white/60 p-8 max-w-2xl mx-auto">
                            <h3 className="font-heading text-2xl font-bold text-warm-text mb-3">
                                Ready to Adopt?
                            </h3>
                            <p className="text-warm-muted mb-6">
                                Each pet deserves a loving home. When you find your perfect match, we're here to guide you through the adoption process.
                            </p>
                            <Link to="/how-it-works" className="btn-primary inline-flex items-center gap-2">
                                Learn How It Works
                            </Link>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
