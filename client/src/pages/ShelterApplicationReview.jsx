import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

export default function ShelterApplicationReview() {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, pending, under_review
    const [selectedApp, setSelectedApp] = useState(null);
    const [statusNotes, setStatusNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'shelter') {
            navigate('/dashboard');
            return;
        }

        fetchApplications();
    }, [user, navigate]);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('aurelia_token');
            const response = await fetch('http://localhost:5000/api/adoptions/shelter/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApplications(data);
            } else {
                console.error('Failed to fetch applications');
            }
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId, newStatus) => {
        setUpdating(true);
        try {
            const token = localStorage.getItem('aurelia_token');
            const response = await fetch(`http://localhost:5000/api/adoptions/${applicationId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus,
                    notes: statusNotes
                })
            });

            if (response.ok) {
                showNotification(`Application ${newStatus} successfully`, 'success');
                setStatusNotes('');
                setSelectedApp(null);
                fetchApplications();
            } else {
                const data = await response.json();
                showNotification(data.error || 'Failed to update status', 'error');
            }
        } catch (error) {
            console.error('Update error:', error);
            showNotification('Failed to update status', 'error');
        } finally {
            setUpdating(false);
        }
    };

    const filteredApplications = applications.filter(app => {
        if (filter === 'all') return true;
        return app.status === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-warm-bg">
                <Navbar />
                <div className="container mx-auto px-6 py-24 text-center">
                    <p className="text-accent-700">Loading applications...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-warm-bg">
            <Navbar />
            
            <main className="container mx-auto px-6 py-24">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold text-accent-900 mb-2">
                        Adoption Applications
                    </h1>
                    <p className="text-accent-600 mb-8">
                        Review and manage all adoption applications
                    </p>

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-2 rounded-full transition ${
                                filter === 'all'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-accent-700 border border-gray-200 hover:border-primary-300'
                            }`}
                        >
                            All ({applications.length})
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-6 py-2 rounded-full transition ${
                                filter === 'pending'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-accent-700 border border-gray-200 hover:border-primary-300'
                            }`}
                        >
                            Pending ({applications.filter(a => a.status === 'pending').length})
                        </button>
                        <button
                            onClick={() => setFilter('under_review')}
                            className={`px-6 py-2 rounded-full transition ${
                                filter === 'under_review'
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-accent-700 border border-gray-200 hover:border-primary-300'
                            }`}
                        >
                            Under Review ({applications.filter(a => a.status === 'under_review').length})
                        </button>
                    </div>

                    {/* Applications List */}
                    {filteredApplications.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                            <div className="text-6xl mb-4">📋</div>
                            <h2 className="text-2xl font-playfair font-bold text-accent-900 mb-2">
                                No Applications
                            </h2>
                            <p className="text-accent-600">
                                {filter === 'all'
                                    ? 'No applications have been submitted yet.'
                                    : `No ${filter.replace('_', ' ')} applications.`}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredApplications.map((app) => (
                                <div
                                    key={app.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    <div className="p-6">
                                        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                            <div className="flex gap-4">
                                                <img
                                                    src={app.pet_image}
                                                    alt={app.pet_name}
                                                    className="w-20 h-20 object-cover rounded-xl"
                                                />
                                                <div>
                                                    <h3 className="text-xl font-playfair font-bold text-accent-900 mb-1">
                                                        {app.pet_name}
                                                    </h3>
                                                    <p className="text-accent-600 text-sm mb-2">
                                                        {app.pet_breed}
                                                    </p>
                                                    <p className="text-accent-700 font-medium">
                                                        Applicant: {app.adopter_name}
                                                    </p>
                                                    <p className="text-accent-600 text-sm">
                                                        {app.adopter_email}
                                                    </p>
                                                </div>
                                            </div>
                                            <StatusBadge status={app.status} />
                                        </div>

                                        <div className="grid md:grid-cols-3 gap-4 mb-4 text-sm">
                                            <div>
                                                <span className="text-accent-500">Application ID:</span>{' '}
                                                <span className="text-accent-900 font-medium">#{app.id}</span>
                                            </div>
                                            <div>
                                                <span className="text-accent-500">Submitted:</span>{' '}
                                                <span className="text-accent-900 font-medium">
                                                    {format(new Date(app.created_at), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-accent-500">Home:</span>{' '}
                                                <span className="text-accent-900 font-medium capitalize">
                                                    {app.home_type} ({app.home_ownership})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                onClick={() => navigate(`/applications/${app.id}`)}
                                                className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition text-sm"
                                            >
                                                View Full Application
                                            </button>

                                            {app.status === 'pending' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(app.id, 'under_review')}
                                                    disabled={updating}
                                                    className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition text-sm disabled:opacity-50"
                                                >
                                                    Start Review
                                                </button>
                                            )}

                                            {(app.status === 'pending' || app.status === 'under_review') && (
                                                <>
                                                    <button
                                                        onClick={() => setSelectedApp(app)}
                                                        className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition text-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedApp(app);
                                                            setTimeout(() => {
                                                                const rejectBtn = document.getElementById(`reject-${app.id}`);
                                                                if (rejectBtn) rejectBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                                                            }, 100);
                                                        }}
                                                        className="px-6 py-2 border border-red-300 text-red-700 rounded-full hover:bg-red-50 transition text-sm"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}

                                            {app.status === 'approved' && (
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition text-sm"
                                                >
                                                    Mark Completed
                                                </button>
                                            )}
                                        </div>

                                        {/* Status Update Form */}
                                        {selectedApp?.id === app.id && (
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <h4 className="font-medium text-accent-900 mb-3">Update Application Status</h4>
                                                <div className="space-y-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-accent-700 mb-2">
                                                            Notes (optional)
                                                        </label>
                                                        <textarea
                                                            value={statusNotes}
                                                            onChange={(e) => setStatusNotes(e.target.value)}
                                                            rows="3"
                                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                            placeholder="Add any notes about this decision..."
                                                        />
                                                    </div>

                                                    <div className="flex gap-3">
                                                        {app.status === 'pending' || app.status === 'under_review' ? (
                                                            <>
                                                                <button
                                                                    onClick={() => handleStatusUpdate(app.id, 'approved')}
                                                                    disabled={updating}
                                                                    className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition text-sm disabled:opacity-50"
                                                                >
                                                                    {updating ? 'Updating...' : 'Confirm Approval'}
                                                                </button>
                                                                <button
                                                                    id={`reject-${app.id}`}
                                                                    onClick={() => handleStatusUpdate(app.id, 'rejected')}
                                                                    disabled={updating}
                                                                    className="px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition text-sm disabled:opacity-50"
                                                                >
                                                                    {updating ? 'Updating...' : 'Confirm Rejection'}
                                                                </button>
                                                            </>
                                                        ) : app.status === 'approved' ? (
                                                            <button
                                                                onClick={() => handleStatusUpdate(app.id, 'completed')}
                                                                disabled={updating}
                                                                className="px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition text-sm disabled:opacity-50"
                                                            >
                                                                {updating ? 'Updating...' : 'Confirm Completion'}
                                                            </button>
                                                        ) : null}
                                                        
                                                        <button
                                                            onClick={() => {
                                                                setSelectedApp(null);
                                                                setStatusNotes('');
                                                            }}
                                                            className="px-6 py-2 border border-gray-300 text-accent-700 rounded-full hover:bg-gray-50 transition text-sm"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
