import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPaw, FaEnvelope, FaLock, FaUser, FaPhone, FaHome, FaBuilding, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';

export default function Register() {
    const { login } = useAuth();
    const { success, error: showError } = useNotification();
    const navigate = useNavigate();

    const [role, setRole] = useState('adopter');
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        shelterName: '',
        address: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            const errorMsg = 'Passwords do not match';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        if (form.password.length < 6) {
            const errorMsg = 'Password must be at least 6 characters';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role,
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    phone: form.phone || undefined,
                    shelterName: form.shelterName || undefined,
                    address: form.address || undefined,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                showError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }

            login(data.user, data.token);
            success(`Welcome to Aurelia, ${data.user.name.split(' ')[0]}! 🐾`);
            navigate('/pets');
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
            <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-warm-bg via-primary-50 to-[#FFF5E0] px-4 py-12">
            {/* Decorative orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[20%] -left-[10%] w-[400px] h-[400px] rounded-full
          bg-[radial-gradient(circle,_#FFE08240,_transparent_70%)] blur-[80px] opacity-50" />
                <div className="absolute -bottom-[15%] -right-[10%] w-[350px] h-[350px] rounded-full
          bg-[radial-gradient(circle,_#FFE0B240,_transparent_70%)] blur-[80px] opacity-50" />
            </div>

            <div className="relative z-10 w-full max-w-lg">
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
                        <h1 className="font-heading text-2xl font-bold text-warm-text mb-2">Create Your Account</h1>
                        <p className="text-warm-muted text-sm">Join Aurelia and start making a difference</p>
                    </div>

                    {/* Role Toggle */}
                    <div className="flex bg-warm-bg rounded-xl p-1 mb-8 border border-warm-border">
                        <button
                            type="button"
                            onClick={() => setRole('adopter')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold
                transition-all duration-300 ${role === 'adopter'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-warm-text shadow-warm-md'
                                    : 'text-warm-muted hover:text-warm-text'
                                }`}
                        >
                            <FaUser className="text-xs" /> Adopter
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('shelter')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold
                transition-all duration-300 ${role === 'shelter'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-warm-text shadow-warm-md'
                                    : 'text-warm-muted hover:text-warm-text'
                                }`}
                        >
                            <FaBuilding className="text-xs" /> Shelter
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label htmlFor="reg-name" className="block text-sm font-medium text-warm-text mb-1.5">
                                {role === 'shelter' ? 'Contact Name' : 'Full Name'}
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                <input
                                    id="reg-name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border border-warm-border
                    text-warm-text text-sm placeholder:text-warm-faded
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                    transition-all duration-200"
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        {/* Shelter Name — shelter only */}
                        {role === 'shelter' && (
                            <div>
                                <label htmlFor="reg-shelter" className="block text-sm font-medium text-warm-text mb-1.5">
                                    Shelter Name
                                </label>
                                <div className="relative">
                                    <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                    <input
                                        id="reg-shelter"
                                        type="text"
                                        required
                                        value={form.shelterName}
                                        onChange={(e) => updateField('shelterName', e.target.value)}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border border-warm-border
                      text-warm-text text-sm placeholder:text-warm-faded
                      focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                      transition-all duration-200"
                                        placeholder="Happy Paws Shelter"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label htmlFor="reg-email" className="block text-sm font-medium text-warm-text mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                <input
                                    id="reg-email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border border-warm-border
                    text-warm-text text-sm placeholder:text-warm-faded
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                    transition-all duration-200"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="reg-phone" className="block text-sm font-medium text-warm-text mb-1.5">
                                Phone <span className="text-warm-faded">(optional)</span>
                            </label>
                            <div className="relative">
                                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                <input
                                    id="reg-phone"
                                    type="tel"
                                    value={form.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border border-warm-border
                    text-warm-text text-sm placeholder:text-warm-faded
                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                    transition-all duration-200"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>

                        {/* Address — shelter only */}
                        {role === 'shelter' && (
                            <div>
                                <label htmlFor="reg-address" className="block text-sm font-medium text-warm-text mb-1.5">
                                    Shelter Address
                                </label>
                                <div className="relative">
                                    <FaHome className="absolute left-4 top-3.5 text-warm-faded text-sm" />
                                    <textarea
                                        id="reg-address"
                                        value={form.address}
                                        onChange={(e) => updateField('address', e.target.value)}
                                        rows={2}
                                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border border-warm-border
                      text-warm-text text-sm placeholder:text-warm-faded resize-none
                      focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                      transition-all duration-200"
                                        placeholder="123 Pet Street, City, State"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="reg-password" className="block text-sm font-medium text-warm-text mb-1.5">
                                    Password
                                </label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                    <input
                                        id="reg-password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={form.password}
                                        onChange={(e) => updateField('password', e.target.value)}
                                        className="w-full pl-11 pr-10 py-3 rounded-xl bg-warm-bg border border-warm-border
                                            text-warm-text text-sm placeholder:text-warm-faded
                                            focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                                            transition-all duration-200"
                                        placeholder="Min 6 chars"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-faded hover:text-warm-muted transition-colors text-sm"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="reg-confirm" className="block text-sm font-medium text-warm-text mb-1.5">
                                    Confirm
                                </label>
                                <div className="relative">
                                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                    <input
                                        id="reg-confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        required
                                        value={form.confirmPassword}
                                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                                        className="w-full pl-11 pr-10 py-3 rounded-xl bg-warm-bg border border-warm-border
                                            text-warm-text text-sm placeholder:text-warm-faded
                                            focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                                            transition-all duration-200"
                                        placeholder="Re-enter"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-faded hover:text-warm-muted transition-colors text-sm"
                                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                    >
                                        {showConfirm ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary text-base py-3.5 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating account...
                                </span>
                            ) : (
                                <>
                                    {role === 'shelter' ? 'Register Shelter' : 'Create Account'} <FaArrowRight />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-warm-muted mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary-700 font-semibold hover:text-primary-800 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}
