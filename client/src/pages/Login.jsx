import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPaw, FaEnvelope, FaLock, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';

export default function Login() {
    const { login } = useAuth();
    const { success, error: showError } = useNotification();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
                showError(data.error || 'Login failed');
                setLoading(false);
                return;
            }

            login(data.user, data.token);
            success(`Welcome back, ${data.user.name.split(' ')[0]}! 🎉`);
            
            // Redirect based on role
            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/pets');
            }
        } catch {
            const errorMsg = 'Network error. Please try again.';
            setError(errorMsg);
            showError(errorMsg);
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-warm-bg via-primary-50 to-[#FFF5E0] px-4">
            {/* Decorative orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -right-[10%] w-[400px] h-[400px] rounded-full
          bg-[radial-gradient(circle,_#FFE08240,_transparent_70%)] blur-[80px] opacity-50" />
                <div className="absolute -bottom-[15%] -left-[10%] w-[350px] h-[350px] rounded-full
          bg-[radial-gradient(circle,_#FFE0B240,_transparent_70%)] blur-[80px] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center gap-2 mb-8">
                    <FaPaw className="text-primary-600 text-2xl" />
                    <span className="font-heading text-3xl font-bold bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                        Aurelia
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-warm-xl border border-white/60 p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="font-heading text-2xl font-bold text-warm-text mb-2">Welcome Back</h1>
                        <p className="text-warm-muted text-sm">Sign in to continue your adoption journey</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-warm-text mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                <input
                                    id="login-email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border border-warm-border
                    text-warm-text text-sm placeholder:text-warm-faded
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                    transition-all duration-200"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-warm-text mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    className="w-full pl-11 pr-11 py-3 rounded-xl bg-warm-bg border border-warm-border
                                        text-warm-text text-sm placeholder:text-warm-faded
                                        focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                                        transition-all duration-200"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-faded hover:text-warm-muted transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary text-base py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                <>Sign In <FaArrowRight /></>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-warm-muted mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary-700 font-semibold hover:text-primary-800 transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}
