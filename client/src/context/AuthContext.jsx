import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('aurelia_token'));
    const [loading, setLoading] = useState(true);

    // On mount, verify stored token
    useEffect(() => {
        if (token) {
            fetch('http://localhost:5000/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
            })
                .then((res) => (res.ok ? res.json() : Promise.reject()))
                .then((data) => setUser(data))
                .catch(() => {
                    localStorage.removeItem('aurelia_token');
                    setToken(null);
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [token]);

    const login = (userData, jwtToken) => {
        localStorage.setItem('aurelia_token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('aurelia_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
