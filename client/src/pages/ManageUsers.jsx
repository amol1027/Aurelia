import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, Navigate } from 'react-router-dom';
import { FaEdit, FaSearch, FaSignOutAlt, FaTrash, FaUserShield, FaUsers } from 'react-icons/fa';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
}

export default function ManageUsers() {
    const { user, token, loading, logout } = useAuth();
    const { success, error, info } = useNotification();

    const [users, setUsers] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [menuOpen, setMenuOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [menuOpen]);

    const fetchUsers = async () => {
        if (!token) return;

        setPageLoading(true);
        try {
            const params = new URLSearchParams();
            if (roleFilter !== 'all') params.set('role', roleFilter);
            if (query.trim()) params.set('search', query.trim());

            const response = await fetch(`http://localhost:5000/api/admin/users?${params.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load users');
            }

            setUsers(data);
        } catch (err) {
            error(err.message || 'Failed to load users');
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, roleFilter]);

    const filteredUsers = useMemo(() => {
        const q = query.toLowerCase();
        if (!q) return users;
        return users.filter((u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q)
        );
    }, [users, query]);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;

    const handleLogout = () => {
        logout();
        info('Admin logged out successfully');
        setMenuOpen(false);
    };

    const openEdit = (selected) => {
        setEditUser({
            id: selected.id,
            role: selected.role,
            name: selected.name,
            email: selected.email,
            phone: selected.phone || '',
            shelterName: selected.shelterName || '',
            address: selected.address || '',
        });
    };

    const closeEdit = () => {
        if (saving) return;
        setEditUser(null);
    };

    const submitEdit = async (event) => {
        event.preventDefault();
        if (!editUser) return;

        if (editUser.role === 'shelter' && !editUser.shelterName.trim()) {
            error('Shelter name is required for shelter role');
            return;
        }

        try {
            setSaving(true);
            const response = await fetch(`http://localhost:5000/api/admin/users/${editUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    role: editUser.role,
                    name: editUser.name,
                    email: editUser.email,
                    phone: editUser.phone,
                    shelterName: editUser.shelterName,
                    address: editUser.address,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to update user');
            }

            success('User updated successfully');
            setEditUser(null);
            fetchUsers();
        } catch (err) {
            error(err.message || 'Failed to update user');
        } finally {
            setSaving(false);
        }
    };

    const deleteUser = async (selected) => {
        const confirmDelete = window.confirm(`Delete user "${selected.name}"? This action cannot be undone.`);
        if (!confirmDelete) return;

        try {
            setDeletingId(selected.id);
            const response = await fetch(`http://localhost:5000/api/admin/users/${selected.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete user');
            }

            success('User deleted successfully');
            fetchUsers();
        } catch (err) {
            error(err.message || 'Failed to delete user');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-dvh bg-warm-bg">
            <header className="sticky top-0 z-50 bg-warm-bg/80 backdrop-blur-2xl border-b border-warm-border/60">
                <nav className="max-w-[1320px] mx-auto px-6 h-[64px] flex items-center justify-between" aria-label="Manage users navigation">
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
                        <div className="hidden sm:flex items-center gap-2 bg-accent-50 backdrop-blur-md rounded-full pl-1 pr-4 py-1 border border-accent-200">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center text-white text-xs font-bold shadow-warm-sm">
                                <FaUserShield />
                            </div>
                            <span className="text-sm font-semibold text-warm-text">Administrator</span>
                        </div>

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

            <main className="max-w-[1320px] mx-auto px-6 py-10 md:py-16">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
                    <div>
                        <span className="section-label">Administration</span>
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-warm-text">Manage Users</h1>
                        <p className="text-warm-muted mt-2">View, update, and remove adopter and shelter accounts.</p>
                    </div>
                    <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm text-primary-800 font-medium inline-flex items-center gap-2">
                        <FaUsers /> {users.length} user{users.length === 1 ? '' : 's'} loaded
                    </div>
                </div>

                <section className="bg-white rounded-2xl border border-warm-border/60 p-4 md:p-6 shadow-warm-sm">
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_180px_auto] gap-3 mb-5">
                        <label className="relative block">
                            <span className="sr-only">Search users</span>
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-faded" />
                            <input
                                type="text"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by name or email"
                                className="w-full rounded-xl border border-warm-border bg-[#FFFEFA] pl-10 pr-4 py-2.5 text-sm text-warm-text placeholder:text-warm-faded focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </label>

                        <select
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                            className="rounded-xl border border-warm-border bg-[#FFFEFA] px-3 py-2.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary-300"
                        >
                            <option value="all">All roles</option>
                            <option value="adopter">Adopter</option>
                            <option value="shelter">Shelter</option>
                        </select>

                        <button
                            onClick={fetchUsers}
                            className="btn-secondary px-5 py-2.5 text-sm"
                            type="button"
                        >
                            Refresh
                        </button>
                    </div>

                    {pageLoading ? (
                        <div className="py-14 text-center text-warm-muted">Loading users...</div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="py-14 text-center text-warm-muted">No users found for current filters.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[880px] text-sm">
                                <thead>
                                    <tr className="border-b border-warm-border/70 text-left text-warm-faded">
                                        <th className="py-3 pr-3 font-semibold">Name</th>
                                        <th className="py-3 px-3 font-semibold">Email</th>
                                        <th className="py-3 px-3 font-semibold">Role</th>
                                        <th className="py-3 px-3 font-semibold">Phone</th>
                                        <th className="py-3 px-3 font-semibold">Created</th>
                                        <th className="py-3 pl-3 text-right font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((item) => (
                                        <tr key={item.id} className="border-b border-warm-border/50 last:border-b-0">
                                            <td className="py-3 pr-3">
                                                <p className="font-semibold text-warm-text">{item.name}</p>
                                                {item.shelterName && <p className="text-xs text-warm-faded">{item.shelterName}</p>}
                                            </td>
                                            <td className="py-3 px-3 text-warm-muted">{item.email}</td>
                                            <td className="py-3 px-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.role === 'shelter' ? 'bg-accent-50 text-accent-700' : 'bg-primary-50 text-primary-700'}`}>
                                                    {item.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-3 text-warm-muted">{item.phone || 'N/A'}</td>
                                            <td className="py-3 px-3 text-warm-muted">{formatDate(item.createdAt)}</td>
                                            <td className="py-3 pl-3">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(item)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100"
                                                        type="button"
                                                    >
                                                        <FaEdit /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(item)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
                                                        disabled={deletingId === item.id}
                                                        type="button"
                                                    >
                                                        <FaTrash /> {deletingId === item.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            {editUser && (
                <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4" role="dialog" aria-modal="true">
                    <div className="w-full max-w-2xl rounded-2xl bg-[#FFFDF7] border border-warm-border shadow-2xl">
                        <div className="flex items-center justify-between p-5 border-b border-warm-border">
                            <h2 className="font-heading text-2xl font-bold text-warm-text">Edit User</h2>
                            <button onClick={closeEdit} className="p-2 text-warm-faded hover:text-warm-text" aria-label="Close edit modal">
                                <HiX size={20} />
                            </button>
                        </div>

                        <form onSubmit={submitEdit} className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-warm-faded uppercase tracking-wide">Role</span>
                                <select
                                    value={editUser.role}
                                    onChange={(event) => setEditUser((prev) => ({ ...prev, role: event.target.value }))}
                                    className="rounded-xl border border-warm-border bg-white px-3 py-2.5 text-sm"
                                >
                                    <option value="adopter">Adopter</option>
                                    <option value="shelter">Shelter</option>
                                </select>
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-warm-faded uppercase tracking-wide">Full Name</span>
                                <input
                                    type="text"
                                    required
                                    value={editUser.name}
                                    onChange={(event) => setEditUser((prev) => ({ ...prev, name: event.target.value }))}
                                    className="rounded-xl border border-warm-border bg-white px-3 py-2.5 text-sm"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 md:col-span-2">
                                <span className="text-xs font-semibold text-warm-faded uppercase tracking-wide">Email</span>
                                <input
                                    type="email"
                                    required
                                    value={editUser.email}
                                    onChange={(event) => setEditUser((prev) => ({ ...prev, email: event.target.value }))}
                                    className="rounded-xl border border-warm-border bg-white px-3 py-2.5 text-sm"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-warm-faded uppercase tracking-wide">Phone</span>
                                <input
                                    type="text"
                                    value={editUser.phone}
                                    onChange={(event) => setEditUser((prev) => ({ ...prev, phone: event.target.value }))}
                                    className="rounded-xl border border-warm-border bg-white px-3 py-2.5 text-sm"
                                />
                            </label>

                            <label className="flex flex-col gap-1.5">
                                <span className="text-xs font-semibold text-warm-faded uppercase tracking-wide">Shelter Name</span>
                                <input
                                    type="text"
                                    value={editUser.shelterName}
                                    onChange={(event) => setEditUser((prev) => ({ ...prev, shelterName: event.target.value }))}
                                    className="rounded-xl border border-warm-border bg-white px-3 py-2.5 text-sm"
                                    placeholder={editUser.role === 'shelter' ? 'Required for shelter role' : 'Optional'}
                                />
                            </label>

                            <label className="flex flex-col gap-1.5 md:col-span-2">
                                <span className="text-xs font-semibold text-warm-faded uppercase tracking-wide">Address</span>
                                <textarea
                                    value={editUser.address}
                                    onChange={(event) => setEditUser((prev) => ({ ...prev, address: event.target.value }))}
                                    rows={3}
                                    className="rounded-xl border border-warm-border bg-white px-3 py-2.5 text-sm resize-none"
                                />
                            </label>

                            <div className="md:col-span-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-2">
                                <button type="button" onClick={closeEdit} className="btn-secondary px-5 py-2.5 text-sm" disabled={saving}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary px-5 py-2.5 text-sm" disabled={saving}>
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
