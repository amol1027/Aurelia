import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Navigate } from 'react-router-dom';
import { FaClipboardList, FaSignOutAlt, FaUserShield } from 'react-icons/fa';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function parseApiResponse(response) {
    const text = await response.text();
    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch {
        return null;
    }
}

export default function AdminAdoptions() {
    const { user, token, loading, logout } = useAuth();
    const { error, info } = useNotification();
    const [applications, setApplications] = useState([]);
    const [fetching, setFetching] = useState(true);
    const [filter, setFilter] = useState('all');
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [menuOpen]);

    useEffect(() => {
        if (!token || !user || user.role !== 'admin') return;

        const fetchApplications = async () => {
            setFetching(true);
            try {
                const response = await fetch(`${API_BASE_URL}/api/adoptions/admin/all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await parseApiResponse(response);

                if (!data) {
                    throw new Error('Server returned non-JSON data. Check backend URL and API server status.');
                }

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch adoption applications');
                }

                setApplications(Array.isArray(data) ? data : []);
            } catch (err) {
                error(err.message || 'Failed to fetch adoption applications');
            } finally {
                setFetching(false);
            }
        };

        fetchApplications();
    }, [token, user, error]);

    const statusCounts = useMemo(() => {
        return applications.reduce((acc, app) => {
            const key = app.status || 'unknown';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
    }, [applications]);

    const filteredApplications = useMemo(() => {
        if (filter === 'all') return applications;
        return applications.filter((app) => app.status === filter);
    }, [applications, filter]);

    const handleLogout = () => {
        logout();
        info('Admin logged out successfully');
        setMenuOpen(false);
    };

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

    return (
        <div className="min-h-dvh bg-warm-bg">
            <header className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-2xl border-b border-warm-border/60">
                <nav className="max-w-[1320px] mx-auto px-6 h-[64px] flex items-center justify-between" aria-label="Admin adoption navigation">
                    <div className="flex items-center gap-5">
                        <Link to="/admin" className="flex items-center gap-2 font-heading text-xl font-bold shrink-0">
                            <FaUserShield className="text-accent-600" />
                            <span className="bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                                Admin Panel
                            </span>
                        </Link>

                        <div className="hidden md:flex items-center gap-1">
                            {[
                                { label: 'Overview', to: '/admin', end: true },
                                { label: 'Users', to: '/admin/users' },
                                { label: 'List Pets', to: '/admin/pets' },
                                { label: 'Messages', to: '/admin/messages' },
                                { label: 'Adoptions', to: '/admin/adoptions' },
                            ].map(({ label, to, end }) => (
                                <NavLink
                                    key={to + label}
                                    to={to}
                                    end={end}
                                    className={({ isActive }) =>
                                        `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ` +
                                        (isActive
                                            ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                            : 'text-warm-muted hover:text-warm-text hover:bg-warm-border/30')
                                    }
                                >
                                    {label}
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleLogout}
                            className="hidden sm:flex p-2 rounded-lg text-warm-faded hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                            aria-label="Logout"
                        >
                            <FaSignOutAlt size={18} />
                        </button>

                        <button
                            className="flex md:hidden items-center justify-center text-warm-text z-[60]"
                            onClick={() => setMenuOpen(!menuOpen)}
                            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? <HiX size={24} /> : <HiMenuAlt3 size={24} />}
                        </button>
                    </div>
                </nav>

                {menuOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 z-[55] md:hidden"
                        onClick={() => setMenuOpen(false)}
                        aria-hidden="true"
                    />
                )}
                <div
                    className={`fixed top-0 right-0 w-[280px] h-dvh bg-[#FFFDF7] z-[60] flex flex-col shadow-[-8px_0_30px_rgba(0,0,0,0.15)] transition-transform duration-300 ease-out md:hidden ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
                >
                    <div className="flex items-center justify-between px-6 h-[64px] border-b border-warm-border/60">
                        <span className="font-heading font-bold text-lg bg-gradient-to-br from-accent-700 to-primary-700 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                        <button onClick={() => setMenuOpen(false)} aria-label="Close menu" className="p-1 text-warm-faded hover:text-warm-text">
                            <HiX size={22} />
                        </button>
                    </div>

                    <nav className="flex flex-col gap-1 px-4 pt-6 flex-1" aria-label="Admin mobile navigation">
                        {[
                            { label: 'Overview', to: '/admin', end: true },
                            { label: 'Users', to: '/admin/users' },
                            { label: 'List Pets', to: '/admin/pets' },
                            { label: 'Messages', to: '/admin/messages' },
                            { label: 'Adoptions', to: '/admin/adoptions' },
                            { label: 'Main Site', to: '/', end: true },
                        ].map(({ label, to, end }) => (
                            <NavLink
                                key={to + label}
                                to={to}
                                end={end}
                                onClick={() => setMenuOpen(false)}
                                className={({ isActive }) =>
                                    `px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ` +
                                    (isActive
                                        ? 'bg-primary-50 text-primary-700 border border-primary-100'
                                        : 'text-warm-muted hover:text-warm-text hover:bg-warm-border/30')
                                }
                            >
                                {label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="px-4 pb-8 border-t border-warm-border/60 pt-4">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 border border-red-100 transition-all duration-200"
                        >
                            <FaSignOutAlt /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1320px] mx-auto px-6 py-10 md:py-12">
                <div className="mb-6">
                    <span className="section-label">Adoption Operations</span>
                    <h1 className="font-heading text-3xl md:text-4xl font-bold text-warm-text mb-2">Adoption Applications</h1>
                    <p className="text-warm-muted text-sm md:text-base">Track every application across shelters and adopters.</p>
                </div>

                <section className="bg-white border border-warm-border/60 rounded-3xl shadow-warm-sm p-6">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        {[
                            { key: 'all', label: `All (${applications.length})` },
                            { key: 'pending', label: `Pending (${statusCounts.pending || 0})` },
                            { key: 'under_review', label: `Under Review (${statusCounts.under_review || 0})` },
                            { key: 'approved', label: `Approved (${statusCounts.approved || 0})` },
                            { key: 'completed', label: `Completed (${statusCounts.completed || 0})` },
                        ].map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setFilter(item.key)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    filter === item.key
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-warm-bg text-warm-muted hover:text-warm-text border border-warm-border/70'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {fetching ? (
                        <div className="py-16 text-center text-warm-muted text-sm">Loading adoption applications...</div>
                    ) : filteredApplications.length === 0 ? (
                        <div className="py-16 text-center text-warm-muted">
                            <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mx-auto mb-4">
                                <FaClipboardList size={22} />
                            </div>
                            <p className="font-medium">No applications found for this filter.</p>
                            <p className="text-sm text-warm-faded mt-1">Try a different status filter.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredApplications.map((app) => (
                                <article key={app.id} className="border border-warm-border/60 rounded-2xl p-4 md:p-5 bg-[#FFFEFA]">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={app.pet_image}
                                                alt={app.pet_name}
                                                className="w-20 h-20 rounded-xl object-cover border border-warm-border/60"
                                            />
                                            <div>
                                                <p className="text-xs text-warm-muted">Application #{app.id}</p>
                                                <h3 className="text-lg font-semibold text-warm-text">{app.pet_name}</h3>
                                                <p className="text-sm text-warm-muted">{app.pet_breed}</p>
                                                <p className="text-xs text-warm-faded mt-1">
                                                    Submitted {format(new Date(app.created_at), 'MMM d, yyyy')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-start md:items-end gap-2">
                                            <StatusBadge status={app.status} />
                                            <div className="text-xs text-warm-faded">
                                                Last update {format(new Date(app.updated_at), 'MMM d, yyyy')}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-warm-faded text-xs">Adopter</p>
                                            <p className="text-warm-text font-medium">{app.adopter_name}</p>
                                            <p className="text-warm-muted text-xs">{app.adopter_email}</p>
                                        </div>
                                        <div>
                                            <p className="text-warm-faded text-xs">Shelter</p>
                                            <p className="text-warm-text font-medium">
                                                {app.owner_shelter_name || app.owner_name || 'Unassigned'}
                                            </p>
                                            <p className="text-warm-muted text-xs">{app.owner_role || 'shelter'}</p>
                                        </div>
                                        <div>
                                            <p className="text-warm-faded text-xs">Review Notes</p>
                                            <p className="text-warm-muted text-xs">Use the shelter portal to update status and notes.</p>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
