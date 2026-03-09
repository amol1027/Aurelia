import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
    const { user, token } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch favorites from database when user logs in
    useEffect(() => {
        if (user && token) {
            setLoading(true);
            fetch('http://localhost:5000/api/favorites', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    throw new Error('Failed to fetch favorites');
                })
                .then((data) => {
                    setFavorites(data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error('Failed to load favorites:', err);
                    setFavorites([]);
                    setLoading(false);
                });
        } else {
            setFavorites([]);
        }
    }, [user, token]);

    const toggleFavorite = async (petId) => {
        if (!user || !token) return;

        const wasFavorite = favorites.includes(petId);

        // Optimistic update
        if (wasFavorite) {
            setFavorites((prev) => prev.filter((id) => id !== petId));
        } else {
            setFavorites((prev) => [...prev, petId]);
        }

        try {
            if (wasFavorite) {
                // Remove from favorites
                const res = await fetch(`http://localhost:5000/api/favorites/${petId}`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    const error = await res.json();
                    console.error('Server error:', error);
                    throw new Error(error.error || 'Failed to remove favorite');
                }
            } else {
                // Add to favorites
                const res = await fetch('http://localhost:5000/api/favorites', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ petId }),
                });
                if (!res.ok) {
                    const error = await res.json();
                    console.error('Server error:', error);
                    throw new Error(error.error || 'Failed to add favorite');
                }
            }
        } catch (err) {
            console.error('Failed to update favorite:', err);
            // Revert on error
            if (wasFavorite) {
                setFavorites((prev) => [...prev, petId]);
            } else {
                setFavorites((prev) => prev.filter((id) => id !== petId));
            }
        }
    };

    const isFavorite = (petId) => {
        return favorites.includes(petId);
    };

    const addFavorite = async (petId) => {
        if (!user || !token || favorites.includes(petId)) return;

        setFavorites((prev) => [...prev, petId]);

        try {
            const res = await fetch('http://localhost:5000/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ petId }),
            });
            if (!res.ok) throw new Error('Failed to add favorite');
        } catch (err) {
            console.error('Failed to add favorite:', err);
            setFavorites((prev) => prev.filter((id) => id !== petId));
        }
    };

    const removeFavorite = async (petId) => {
        if (!user || !token) return;

        setFavorites((prev) => prev.filter((id) => id !== petId));

        try {
            const res = await fetch(`http://localhost:5000/api/favorites/${petId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to remove favorite');
        } catch (err) {
            console.error('Failed to remove favorite:', err);
            setFavorites((prev) => [...prev, petId]);
        }
    };

    const clearFavorites = () => {
        setFavorites([]);
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                loading,
                toggleFavorite,
                isFavorite,
                addFavorite,
                removeFavorite,
                clearFavorites,
                count: favorites.length,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const ctx = useContext(FavoritesContext);
    if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
    return ctx;
}
