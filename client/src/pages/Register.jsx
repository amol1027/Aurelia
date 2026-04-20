import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaPaw, FaEnvelope, FaLock, FaUser, FaPhone, FaHome, FaBuilding, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[0-9\s()\-]{10,12}$/;

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
    const [submitError, setSubmitError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const validateField = (field, value, currentForm, currentRole) => {
        const trimmed = typeof value === 'string' ? value.trim() : value;

        switch (field) {
            case 'name':
                if (!trimmed) return 'Name is required';
                if (trimmed.length < 2) return 'Name must be at least 2 characters';
                return '';
            case 'email':
                if (!trimmed) return 'Email is required';
                if (!EMAIL_REGEX.test(trimmed)) return 'Please enter a valid email address';
                return '';
            case 'phone':
                if (!trimmed) return '';
                if (trimmed.length < 10 || trimmed.length > 12) return 'Phone number must be at least 10 digits.';
                if (currentForm.phone === '0000000000') return 'Phone number cannot be all zeros';
                if (!PHONE_REGEX.test(trimmed)) return 'Please enter a valid phone number';
                return '';
            case 'shelterName':
                if (currentRole !== 'shelter') return '';
                if (!trimmed) return 'Shelter name is required';
                if (trimmed.length < 3) return 'Shelter name must be at least 3 characters';
                return '';
            case 'address':
                if (currentRole === 'shelter' && !trimmed) return 'Shelter address is required';
                if (trimmed && trimmed.length < 8) return 'Address should be at least 8 characters';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (!/[A-Z]/.test(value)) return 'Password must include an uppercase letter';
                if (!/[a-z]/.test(value)) return 'Password must include a lowercase letter';
                if (!/[0-9]/.test(value)) return 'Password must include a number';
                return '';
            case 'confirmPassword':
                if (!value) return 'Please confirm your password';
                if (value !== currentForm.password) return 'Passwords do not match';
                return '';
            default:
                return '';
        }
    };

    const validateForm = (currentForm, currentRole) => {
        const fieldsToValidate = ['name', 'email', 'phone', 'password', 'confirmPassword', 'address'];
        if (currentRole === 'shelter') fieldsToValidate.push('shelterName');

        const nextErrors = {};
        fieldsToValidate.forEach((field) => {
            const message = validateField(field, currentForm[field], currentForm, currentRole);
            if (message) nextErrors[field] = message;
        });

        return nextErrors;
    };

    const handleFieldChange = (field, value) => {
        const nextForm = { ...form, [field]: value };
        setForm(nextForm);

        if (touched[field] || touched.confirmPassword || (field === 'password' && form.confirmPassword)) {
            const nextErrors = { ...fieldErrors };
            const ownError = validateField(field, value, nextForm, role);

            if (ownError) nextErrors[field] = ownError;
            else delete nextErrors[field];

            if (field === 'password' || field === 'confirmPassword') {
                const confirmError = validateField('confirmPassword', nextForm.confirmPassword, nextForm, role);
                if (confirmError) nextErrors.confirmPassword = confirmError;
                else delete nextErrors.confirmPassword;
            }

            setFieldErrors(nextErrors);
        }
    };

    const handleFieldBlur = (field) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        const message = validateField(field, form[field], form, role);
        setFieldErrors((prev) => {
            const next = { ...prev };
            if (message) next[field] = message;
            else delete next[field];
            return next;
        });
    };

    const handleRoleChange = (nextRole) => {
        if (nextRole === role) return;

        setRole(nextRole);
        setForm({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            shelterName: '',
            address: '',
        });
        setFieldErrors({});
        setTouched({});
        setSubmitError('');
    };

    const inputClass = (field, withRightIcon = false) =>
        `w-full pl-11 ${withRightIcon ? 'pr-10' : 'pr-4'} py-3 rounded-xl bg-warm-bg border text-warm-text text-sm placeholder:text-warm-faded focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${touched[field] && fieldErrors[field]
            ? 'border-red-300 focus:ring-red-300'
            : 'border-warm-border focus:ring-primary-400'
        }`;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        const validationErrors = validateForm(form, role);
        setFieldErrors(validationErrors);
        setTouched({
            name: true,
            email: true,
            phone: true,
            password: true,
            confirmPassword: true,
            shelterName: role === 'shelter',
            address: true,
        });

        if (Object.keys(validationErrors).length > 0) {
            const errorMsg = 'Please fix the highlighted fields';
            setSubmitError(errorMsg);
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
                setSubmitError(data.error || 'Registration failed');
                showError(data.error || 'Registration failed');
                setLoading(false);
                return;
            }

            login(data.user, data.token);
            success(`Welcome to Aurelia, ${data.user.name.split(' ')[0]}! 🐾`);
            navigate('/pets');
        } catch {
            const errorMsg = 'Network error. Please try again.';
            setSubmitError(errorMsg);
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
                            onClick={() => handleRoleChange('adopter')}
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
                            onClick={() => handleRoleChange('shelter')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold
                transition-all duration-300 ${role === 'shelter'
                                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-warm-text shadow-warm-md'
                                    : 'text-warm-muted hover:text-warm-text'
                                }`}
                        >
                            <FaBuilding className="text-xs" /> Shelter
                        </button>
                    </div>

                    {submitError && (
                        <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 border border-red-100">
                            {submitError}
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
                                    onChange={(e) => handleFieldChange('name', e.target.value)}
                                    onBlur={() => handleFieldBlur('name')}
                                    className={inputClass('name')}
                                    placeholder="Your name"
                                />
                            </div>
                            {touched.name && fieldErrors.name && (
                                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.name}</p>
                            )}
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
                                        onChange={(e) => handleFieldChange('shelterName', e.target.value)}
                                        onBlur={() => handleFieldBlur('shelterName')}
                                        className={inputClass('shelterName')}
                                        placeholder="Happy Paws Shelter"
                                    />
                                </div>
                                {touched.shelterName && fieldErrors.shelterName && (
                                    <p className="mt-1.5 text-xs text-red-600">{fieldErrors.shelterName}</p>
                                )}
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
                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                    onBlur={() => handleFieldBlur('email')}
                                    className={inputClass('email')}
                                    placeholder="you@example.com"
                                />
                            </div>
                            {touched.email && fieldErrors.email && (
                                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.email}</p>
                            )}
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
                                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                                    onBlur={() => handleFieldBlur('phone')}
                                    className={inputClass('phone')}
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                            {touched.phone && fieldErrors.phone && (
                                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.phone}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="reg-address" className="block text-sm font-medium text-warm-text mb-1.5">
                                {role === 'shelter' ? 'Shelter Address' : 'Address'}{' '}
                                {role !== 'shelter' && <span className="text-warm-faded">(optional)</span>}
                            </label>
                            <div className="relative">
                                <FaHome className="absolute left-4 top-3.5 text-warm-faded text-sm" />
                                <textarea
                                    id="reg-address"
                                    value={form.address}
                                    onChange={(e) => handleFieldChange('address', e.target.value)}
                                    onBlur={() => handleFieldBlur('address')}
                                    rows={2}
                                    required={role === 'shelter'}
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border text-warm-text text-sm placeholder:text-warm-faded resize-none focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 ${touched.address && fieldErrors.address ? 'border-red-300 focus:ring-red-300' : 'border-warm-border focus:ring-primary-400'}`}
                                    placeholder={role === 'shelter' ? '123 Pet Street, City, State' : 'Street, City, State'}
                                />
                            </div>
                            {touched.address && fieldErrors.address && (
                                <p className="mt-1.5 text-xs text-red-600">{fieldErrors.address}</p>
                            )}
                        </div>

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
                                        onChange={(e) => handleFieldChange('password', e.target.value)}
                                        onBlur={() => handleFieldBlur('password')}
                                        className={inputClass('password', true)}
                                        placeholder="Min 8 chars"
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
                                {touched.password && fieldErrors.password && (
                                    <p className="mt-1.5 text-xs text-red-600">{fieldErrors.password}</p>
                                )}
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
                                        onChange={(e) => handleFieldChange('confirmPassword', e.target.value)}
                                        onBlur={() => handleFieldBlur('confirmPassword')}
                                        className={inputClass('confirmPassword', true)}
                                        placeholder="Re-enter password"
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
                                {touched.confirmPassword && fieldErrors.confirmPassword && (
                                    <p className="mt-1.5 text-xs text-red-600">{fieldErrors.confirmPassword}</p>
                                )}
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
