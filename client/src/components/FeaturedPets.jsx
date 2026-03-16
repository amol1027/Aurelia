import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaPaw, FaClock, FaHeart } from 'react-icons/fa';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

export default function FeaturedPets({ pets }) {
    const { toggleFavorite, isFavorite } = useFavorites();
    const { user } = useAuth();
    const { success, info } = useNotification();
    if (!pets || pets.length === 0) {
        return (
            <section id="pets" className="py-24 bg-warm-bg">
                <div className="max-w-[1280px] mx-auto px-6 text-center">
                    <span className="section-label">Available Pets</span>
                    <h2 className="font-heading text-section font-bold mb-2">Meet Your Future Best Friend</h2>
                    <p className="text-warm-muted max-w-[600px] mx-auto">Loading adorable companions...</p>
                </div>
            </section>
        );
    }

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

    return (
        <section id="pets" className="py-24 bg-warm-bg">
            <div className="max-w-[1280px] mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="section-label">Available Pets</span>
                    <h2 className="font-heading text-section font-bold mb-2">Meet Your Future Best Friend</h2>
                    <p className="text-warm-muted max-w-[600px] mx-auto">
                        Each of our pets has been health-checked, loved, and is waiting for a forever family.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pets.map((pet, i) => (
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
                            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
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
                                        aria-label={`Meet ${pet.name}`}
                                    >
                                        <FaPaw /> Meet {pet.name}
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
                    rounded-full text-sm border
                    transition-all duration-200
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
            </div>
        </section>
    );
}
