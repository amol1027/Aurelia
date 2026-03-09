import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FaPaw, FaUser, FaEnvelope, FaPhone, FaBuilding, FaHome,
    FaEdit, FaSave, FaTimes, FaLock, FaEye, FaEyeSlash,
    FaArrowLeft, FaUserCircle, FaHeart, FaCalendar, FaShieldAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

/* ── Animation variants ───────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({
        opacity: 1, y: 0,
        transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
    }),
};

export default function Profile() {
    const { user, loading, token } = useAuth();
    const { success, error: showError } = useNotification();
    
    const [editing, setEditing] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        shelterName: '',
        address: '',
    });
    
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                shelterName: user.shelterName || '',
                address: user.address || '',
            });
        }
    }, [user]);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;

    const isShelter = user.role === 'shelter';
    const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    }) : 'Recently';

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/update-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.error || 'Failed to update profile');
                setSaving(false);
                return;
            }

            success('Profile updated successfully! 🎉');
            setEditing(false);
            setSaving(false);
            // Note: In production, you'd update the user context here
        } catch {
            showError('Network error. Please try again.');
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            showError('Password must be at least 6 characters');
            return;
        }

        setSaving(true);

        try {
            const res = await fetch('http://localhost:5000/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.error || 'Failed to change password');
                setSaving(false);
                return;
            }

            success('Password changed successfully! 🔒');
            setChangingPassword(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setSaving(false);
        } catch {
            showError('Network error. Please try again.');
            setSaving(false);
        }
    };

    const cancelEdit = () => {
        setForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            shelterName: user.shelterName || '',
            address: user.address || '',
        });
        setEditing(false);
    };

    return (
        <div className="min-h-dvh bg-gradient-to-br from-warm-bg via-primary-50 to-[#FFF5E0] relative overflow-hidden">
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] rounded-full
                    bg-[radial-gradient(circle,_#FFE08220,_transparent_70%)] blur-[100px]" />
                <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full
                    bg-[radial-gradient(circle,_#FFE0B215,_transparent_70%)] blur-[100px]" />
            </div>

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-2xl border-b border-warm-border/60">
                <div className="max-w-[1000px] mx-auto px-6 h-[64px] flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-2 text-warm-muted hover:text-warm-text transition-colors">
                        <FaArrowLeft className="text-sm" />
                        <span className="text-sm font-medium">Back to Dashboard</span>
                    </Link>
                    <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold">
                        <FaPaw className="text-primary-600" />
                        <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                            Aurelia
                        </span>
                    </Link>
                </div>
            </header>

            <main className="relative z-10 max-w-[1000px] mx-auto px-6 py-12">
                {/* Page Title */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    custom={0}
                    className="text-center mb-12"
                >
                    <h1 className="font-heading text-4xl md:text-5xl font-bold text-warm-text mb-3">
                        My Profile
                    </h1>
                    <p className="text-warm-muted text-base max-w-[500px] mx-auto">
                        Manage your personal information and account settings
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left Column - Profile Card */}
                    <motion.div
                        variants={fadeUp}
                        initial="hidden"
                        animate="show"
                        custom={1}
                        className="lg:col-span-1"
                    >
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-warm-xl border border-white/60 p-6 sticky top-24">
                            {/* Avatar */}
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600
                                    flex items-center justify-center text-white text-3xl font-bold shadow-warm-lg mb-4">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h2 className="font-heading text-2xl font-bold text-warm-text mb-1">
                                    {user.name}
                                </h2>
                                <span className="inline-block px-3 py-1 bg-primary-50 text-primary-700 text-xs font-semibold
                                    rounded-full border border-primary-100 capitalize">
                                    {user.role}
                                </span>
                            </div>

                            {/* Quick Stats */}
                            <div className="space-y-3 pt-4 border-t border-warm-border">
                                <div className="flex items-center gap-3 text-sm">
                                    <FaEnvelope className="text-primary-600" />
                                    <span className="text-warm-muted truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <FaPhone className="text-primary-600" />
                                        <span className="text-warm-muted">{user.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-3 text-sm">
                                    <FaCalendar className="text-primary-600" />
                                    <span className="text-warm-muted">Joined {joinDate}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column - Details & Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Profile Information */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            custom={2}
                            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-warm-xl border border-white/60 p-6 md:p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <FaUserCircle className="text-primary-600 text-xl" />
                                    <h3 className="font-heading text-xl font-bold text-warm-text">
                                        Personal Information
                                    </h3>
                                </div>
                                {!editing && (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700
                                            hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <FaEdit /> Edit
                                    </button>
                                )}
                            </div>

                            {editing ? (
                                <form onSubmit={handleSaveProfile} className="space-y-4">
                                    {/* Name */}
                                    <div>
                                        <label htmlFor="profile-name" className="block text-sm font-medium text-warm-text mb-1.5">
                                            {isShelter ? 'Contact Name' : 'Full Name'}
                                        </label>
                                        <div className="relative">
                                            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                            <input
                                                id="profile-name"
                                                type="text"
                                                required
                                                value={form.name}
                                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border border-warm-border
                                                    text-warm-text text-sm placeholder:text-warm-faded
                                                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                                                    transition-all duration-200"
                                                placeholder="Your name"
                                            />
                                        </div>
                                    </div>

                                    {/* Shelter Name */}
                                    {isShelter && (
                                        <div>
                                            <label htmlFor="profile-shelter" className="block text-sm font-medium text-warm-text mb-1.5">
                                                Shelter Name
                                            </label>
                                            <div className="relative">
                                                <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                                <input
                                                    id="profile-shelter"
                                                    type="text"
                                                    value={form.shelterName}
                                                    onChange={(e) => setForm({ ...form, shelterName: e.target.value })}
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
                                        <label htmlFor="profile-email" className="block text-sm font-medium text-warm-text mb-1.5">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                            <input
                                                id="profile-email"
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

                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="profile-phone" className="block text-sm font-medium text-warm-text mb-1.5">
                                            Phone <span className="text-warm-faded">(optional)</span>
                                        </label>
                                        <div className="relative">
                                            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                            <input
                                                id="profile-phone"
                                                type="tel"
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                className="w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border border-warm-border
                                                    text-warm-text text-sm placeholder:text-warm-faded
                                                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                                                    transition-all duration-200"
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    {/* Address */}
                                    {isShelter && (
                                        <div>
                                            <label htmlFor="profile-address" className="block text-sm font-medium text-warm-text mb-1.5">
                                                Shelter Address
                                            </label>
                                            <div className="relative">
                                                <FaHome className="absolute left-4 top-3.5 text-warm-faded text-sm" />
                                                <textarea
                                                    id="profile-address"
                                                    value={form.address}
                                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                                    rows={3}
                                                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-warm-bg border border-warm-border
                                                        text-warm-text text-sm placeholder:text-warm-faded resize-none
                                                        focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                                                        transition-all duration-200"
                                                    placeholder="123 Pet Street, City, State"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 btn-primary text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Saving...
                                                </span>
                                            ) : (
                                                <><FaSave /> Save Changes</>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={cancelEdit}
                                            disabled={saving}
                                            className="flex-1 btn-secondary text-sm py-3 disabled:opacity-50"
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-4">
                                    <InfoRow label="Name" value={user.name} icon={FaUser} />
                                    {isShelter && user.shelterName && (
                                        <InfoRow label="Shelter Name" value={user.shelterName} icon={FaBuilding} />
                                    )}
                                    <InfoRow label="Email" value={user.email} icon={FaEnvelope} />
                                    <InfoRow label="Phone" value={user.phone || 'Not provided'} icon={FaPhone} />
                                    {isShelter && (
                                        <InfoRow label="Address" value={user.address || 'Not provided'} icon={FaHome} />
                                    )}
                                </div>
                            )}
                        </motion.div>

                        {/* Security Section */}
                        <motion.div
                            variants={fadeUp}
                            initial="hidden"
                            animate="show"
                            custom={3}
                            className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-warm-xl border border-white/60 p-6 md:p-8"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <FaShieldAlt className="text-primary-600 text-xl" />
                                    <h3 className="font-heading text-xl font-bold text-warm-text">
                                        Security Settings
                                    </h3>
                                </div>
                                {!changingPassword && (
                                    <button
                                        onClick={() => setChangingPassword(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-700
                                            hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <FaLock /> Change Password
                                    </button>
                                )}
                            </div>

                            {changingPassword ? (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    {/* Current Password */}
                                    <div>
                                        <label htmlFor="current-password" className="block text-sm font-medium text-warm-text mb-1.5">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                            <input
                                                id="current-password"
                                                type={showPasswords.current ? 'text' : 'password'}
                                                required
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                className="w-full pl-11 pr-11 py-3 rounded-xl bg-warm-bg border border-warm-border
                                                    text-warm-text text-sm placeholder:text-warm-faded
                                                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                                                    transition-all duration-200"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-faded hover:text-warm-muted transition-colors"
                                            >
                                                {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div>
                                        <label htmlFor="new-password" className="block text-sm font-medium text-warm-text mb-1.5">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                            <input
                                                id="new-password"
                                                type={showPasswords.new ? 'text' : 'password'}
                                                required
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                className="w-full pl-11 pr-11 py-3 rounded-xl bg-warm-bg border border-warm-border
                                                    text-warm-text text-sm placeholder:text-warm-faded
                                                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                                                    transition-all duration-200"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-faded hover:text-warm-muted transition-colors"
                                            >
                                                {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div>
                                        <label htmlFor="confirm-password" className="block text-sm font-medium text-warm-text mb-1.5">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                            <input
                                                id="confirm-password"
                                                type={showPasswords.confirm ? 'text' : 'password'}
                                                required
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                className="w-full pl-11 pr-11 py-3 rounded-xl bg-warm-bg border border-warm-border
                                                    text-warm-text text-sm placeholder:text-warm-faded
                                                    focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
                                                    transition-all duration-200"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-warm-faded hover:text-warm-muted transition-colors"
                                            >
                                                {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex-1 btn-primary text-sm py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Updating...
                                                </span>
                                            ) : (
                                                <><FaLock /> Update Password</>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setChangingPassword(false);
                                                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                            }}
                                            disabled={saving}
                                            className="flex-1 btn-secondary text-sm py-3 disabled:opacity-50"
                                        >
                                            <FaTimes /> Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="text-sm text-warm-muted">
                                    <p>Keep your account secure by using a strong, unique password.</p>
                                    <p className="mt-2">Last updated: Never</p>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}

/* ── Helper Component ─────────────────────────────────────── */
function InfoRow({ label, value, icon: Icon }) {
    return (
        <div className="flex items-start gap-3 py-2">
            <Icon className="text-primary-600 text-sm mt-1 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-warm-faded uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-warm-text break-words">{value}</p>
            </div>
        </div>
    );
}
