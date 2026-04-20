import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaPlus, FaSave, FaSearch, FaTrash, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const initialForm = {
    name: '',
    breed: '',
    age: '',
    image: '',
    description: '',
    personalityInput: '',
    ownerUserId: '',
};

function mapPetToForm(pet) {
    return {
        name: pet.name || '',
        breed: pet.breed || '',
        age: pet.age || '',
        image: pet.image || '',
        description: pet.description || '',
        personalityInput: Array.isArray(pet.personality) ? pet.personality.join(', ') : '',
        ownerUserId: pet.ownerUserId ? String(pet.ownerUserId) : '',
    };
}

function parsePersonality(input) {
    return input
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
}

export default function PetListingsManager() {
    const { user, token, loading } = useAuth();
    const { success, error: showError, info } = useNotification();

    const [pets, setPets] = useState([]);
    const [search, setSearch] = useState('');
    const [pageLoading, setPageLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [shelters, setShelters] = useState([]);
    const [sheltersLoading, setSheltersLoading] = useState(false);

    const isManager = user && ['admin', 'shelter', 'adopter'].includes(user.role);

    const fetchPets = async () => {
        try {
            setPageLoading(true);
            const response = await fetch('http://localhost:5000/api/pets');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to load pets');
            }

            setPets(data);
        } catch (err) {
            showError(err.message || 'Failed to load pets');
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchPets();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!token || user?.role !== 'admin') return;

        const fetchShelters = async () => {
            try {
                setSheltersLoading(true);
                const response = await fetch('http://localhost:5000/api/admin/users?role=shelter', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to load shelters');
                }

                setShelters(Array.isArray(data) ? data : []);
            } catch (err) {
                showError(err.message || 'Failed to load shelters');
            } finally {
                setSheltersLoading(false);
            }
        };

        fetchShelters();
    }, [token, user?.role, showError]);

    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (!isManager) return <Navigate to="/dashboard" replace />;

    const ownedPets = useMemo(() => {
        if (user?.role === 'admin') return pets;
        return pets.filter((pet) => Number(pet.ownerUserId) === Number(user?.id));
    }, [pets, user?.role, user?.id]);

    const filteredPets = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return ownedPets;

        return ownedPets.filter((pet) => {
            const tags = Array.isArray(pet.personality) ? pet.personality : [];
            return (
                pet.name.toLowerCase().includes(q) ||
                pet.breed.toLowerCase().includes(q) ||
                pet.age.toLowerCase().includes(q) ||
                tags.some((tag) => tag.toLowerCase().includes(q))
            );
        });
    }, [ownedPets, search]);

    const openCreate = () => {
        setEditingId(null);
        setForm(initialForm);
        setShowForm(true);
    };

    const openEdit = (pet) => {
        setEditingId(pet.id);
        setForm(mapPetToForm(pet));
        setShowForm(true);
    };

    const closeForm = () => {
        if (saving) return;
        setShowForm(false);
        setEditingId(null);
        setForm(initialForm);
    };

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const submitPet = async (event) => {
        event.preventDefault();

        const personality = parsePersonality(form.personalityInput);
        if (personality.length === 0) {
            showError('Please add at least one personality tag');
            return;
        }

        try {
            setSaving(true);
            const payload = {
                name: form.name.trim(),
                breed: form.breed.trim(),
                age: form.age.trim(),
                image: form.image.trim(),
                description: form.description.trim(),
                personality,
                ownerUserId: user.role === 'admin'
                    ? (form.ownerUserId === '' ? null : Number(form.ownerUserId))
                    : undefined,
            };

            const isEdit = Boolean(editingId);
            const response = await fetch(
                isEdit ? `http://localhost:5000/api/pets/${editingId}` : 'http://localhost:5000/api/pets',
                {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to save pet');
            }

            success(isEdit ? 'Pet listing updated successfully' : 'Pet listing created successfully');
            closeForm();
            fetchPets();
        } catch (err) {
            showError(err.message || 'Failed to save pet listing');
        } finally {
            setSaving(false);
        }
    };

    const deletePet = async (pet) => {
        const confirmed = window.confirm(`Delete pet listing "${pet.name}"?`);
        if (!confirmed) return;

        try {
            const response = await fetch(`http://localhost:5000/api/pets/${pet.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete pet');
            }

            info(`${pet.name} listing removed`);
            fetchPets();
        } catch (err) {
            showError(err.message || 'Failed to delete pet listing');
        }
    };

    return (
        <div className="min-h-dvh bg-gradient-to-br from-warm-bg via-primary-50 to-[#FFF6E5]">
            <header className="sticky top-0 z-40 bg-warm-bg/85 backdrop-blur-xl border-b border-warm-border/70">
                <div className="max-w-[1280px] mx-auto px-6 h-[64px] flex items-center justify-between gap-3">
                    <Link
                        to={user.role === 'admin' ? '/admin' : '/dashboard'}
                        className="inline-flex items-center gap-2 text-sm font-medium text-warm-muted hover:text-warm-text transition-colors"
                    >
                        <FaArrowLeft className="text-xs" />
                        Back
                    </Link>
                    <h1 className="font-heading text-lg md:text-xl font-bold text-warm-text">
                        {user.role === 'admin' ? 'Admin Pet Listings' : user.role === 'shelter' ? 'Shelter Pet Listings' : 'My Pet Listings'}
                    </h1>
                    <Link to="/pets" className="text-sm font-medium text-primary-700 hover:text-primary-800 transition-colors">
                        Public View
                    </Link>
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-6 py-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl p-5 shadow-warm-sm">
                        <p className="text-xs uppercase tracking-wide text-warm-faded">Total Listings</p>
                        <p className="font-heading text-3xl font-bold text-warm-text mt-1">{pets.length}</p>
                    </div>
                    <div className="md:col-span-2 bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl p-5 shadow-warm-sm">
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-faded text-sm" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search listings by name, breed, age, or personality"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-border bg-[#FFFEFA] text-sm text-warm-text placeholder:text-warm-faded focus:outline-none focus:ring-2 focus:ring-primary-300"
                                />
                            </div>
                            <button onClick={openCreate} className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2 shrink-0">
                                <FaPlus /> Add Listing
                            </button>
                        </div>
                    </div>
                </div>

                {pageLoading ? (
                    <div className="py-20 flex justify-center">
                        <svg className="animate-spin h-8 w-8 text-primary-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                ) : filteredPets.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl border border-white/70 rounded-2xl p-12 shadow-warm-sm text-center">
                        <h2 className="font-heading text-2xl font-bold text-warm-text mb-2">No pet listings found</h2>
                        <p className="text-sm text-warm-muted mb-6">Try a different search or create a new listing.</p>
                        <button onClick={openCreate} className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
                            <FaPlus /> Create First Listing
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPets.map((pet) => (
                            <article
                                key={pet.id}
                                className="bg-white/85 backdrop-blur-xl border border-white/70 rounded-2xl shadow-warm-sm overflow-hidden hover:shadow-warm-md transition-all duration-300"
                            >
                                <img src={pet.image} alt={pet.name} className="w-full h-52 object-cover" />
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div>
                                            <h3 className="font-heading text-xl font-bold text-warm-text">{pet.name}</h3>
                                            <p className="text-sm text-warm-muted">{pet.breed} · {pet.age}</p>
                                        </div>
                                        <span className="text-xs text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">
                                            #{pet.id}
                                        </span>
                                    </div>
                                    <p className="text-sm text-warm-muted leading-relaxed mb-4 line-clamp-3">{pet.description}</p>
                                    {user.role === 'admin' && (
                                        <p className="text-xs text-warm-faded mb-3">
                                            Owner: {pet.ownerShelterName || pet.ownerName || 'Unassigned'}
                                        </p>
                                    )}
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {Array.isArray(pet.personality) && pet.personality.map((tag) => (
                                            <span key={`${pet.id}-${tag}`} className="text-xs font-medium text-primary-800 bg-primary-50 border border-primary-100 px-2.5 py-0.5 rounded-full">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEdit(pet)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-warm-text border border-warm-border hover:border-primary-300 hover:bg-primary-50 transition-all"
                                        >
                                            <FaEdit /> Edit
                                        </button>
                                        <button
                                            onClick={() => deletePet(pet)}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 transition-all"
                                        >
                                            <FaTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
                    <div className="w-full max-w-2xl bg-white rounded-2xl border border-warm-border shadow-warm-xl max-h-[90dvh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-warm-border px-6 py-4 flex items-center justify-between">
                            <h2 className="font-heading text-2xl font-bold text-warm-text">
                                {editingId ? 'Edit Pet Listing' : 'Create Pet Listing'}
                            </h2>
                            <button onClick={closeForm} className="text-warm-faded hover:text-warm-text transition-colors" aria-label="Close dialog">
                                <FaTimes />
                            </button>
                        </div>

                        <form onSubmit={submitPet} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-warm-text mb-1.5">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.name}
                                        onChange={(event) => updateField('name', event.target.value)}
                                        className="w-full rounded-xl border border-warm-border bg-[#FFFEFA] px-4 py-2.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-warm-text mb-1.5">Breed</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.breed}
                                        onChange={(event) => updateField('breed', event.target.value)}
                                        className="w-full rounded-xl border border-warm-border bg-[#FFFEFA] px-4 py-2.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-warm-text mb-1.5">Age</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.age}
                                        onChange={(event) => updateField('age', event.target.value)}
                                        placeholder="e.g. 2 years"
                                        className="w-full rounded-xl border border-warm-border bg-[#FFFEFA] px-4 py-2.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-warm-text mb-1.5">Image URL</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.image}
                                        onChange={(event) => updateField('image', event.target.value)}
                                        placeholder="/pets/name.webp"
                                        className="w-full rounded-xl border border-warm-border bg-[#FFFEFA] px-4 py-2.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary-300"
                                    />
                                </div>
                            </div>

                            {user.role === 'admin' && (
                                <div>
                                    <label className="block text-sm font-medium text-warm-text mb-1.5">Owner (Shelter)</label>
                                    <select
                                        value={form.ownerUserId}
                                        onChange={(event) => updateField('ownerUserId', event.target.value)}
                                        disabled={sheltersLoading}
                                        className="w-full rounded-xl border border-warm-border bg-[#FFFEFA] px-4 py-2.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:opacity-60"
                                    >
                                        <option value="">Unassigned</option>
                                        {shelters.map((shelter) => (
                                            <option key={shelter.id} value={String(shelter.id)}>
                                                {shelter.shelterName || shelter.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-warm-faded mt-1">Assign owner to enable Chat with Owner for this pet listing.</p>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-warm-text mb-1.5">Personality Tags</label>
                                <input
                                    type="text"
                                    required
                                    value={form.personalityInput}
                                    onChange={(event) => updateField('personalityInput', event.target.value)}
                                    placeholder="Friendly, Playful, Gentle"
                                    className="w-full rounded-xl border border-warm-border bg-[#FFFEFA] px-4 py-2.5 text-sm text-warm-text focus:outline-none focus:ring-2 focus:ring-primary-300"
                                />
                                <p className="text-xs text-warm-faded mt-1">Separate tags with commas.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-warm-text mb-1.5">Description</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={form.description}
                                    onChange={(event) => updateField('description', event.target.value)}
                                    className="w-full rounded-xl border border-warm-border bg-[#FFFEFA] px-4 py-2.5 text-sm text-warm-text resize-none focus:outline-none focus:ring-2 focus:ring-primary-300"
                                />
                            </div>

                            <div className="pt-2 flex flex-wrap justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeForm}
                                    className="px-5 py-2.5 rounded-xl border border-warm-border text-warm-text text-sm font-medium hover:bg-warm-bg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2 disabled:opacity-60"
                                >
                                    <FaSave /> {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Listing'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
