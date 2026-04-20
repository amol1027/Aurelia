import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

export default function MyApplications() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchApplications();
    }, [user, navigate]);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('aurelia_token');
            const response = await fetch(`http://localhost:5000/api/adoptions/user/${user.id}`, {
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

    const handleWithdraw = async (applicationId) => {
        if (!confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('aurelia_token');
            const response = await fetch(`http://localhost:5000/api/adoptions/${applicationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                fetchApplications(); // Refresh list
            } else {
                const data = await response.json();
                alert(data.error || 'Failed to withdraw application');
            }
        } catch (error) {
            console.error('Withdraw error:', error);
            alert('Failed to withdraw application');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-warm-bg">
                <Navbar />
                <div className="container mx-auto px-6 py-24 text-center">
                    <p className="text-accent-700">Loading your applications...</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-warm-bg">
            <Navbar />
            
            <main className="container mx-auto px-6 py-24">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-playfair font-bold text-accent-900 mb-2">
                        My Applications
                    </h1>
                    <p className="text-accent-600 mb-12">
                        Track your adoption applications and their status
                    </p>

                    {applications.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                            <div className="text-6xl mb-4">🐾</div>
                            <h2 className="text-2xl font-playfair font-bold text-accent-900 mb-2">
                                No Applications Yet
                            </h2>
                            <p className="text-accent-600 mb-6">
                                You haven't submitted any adoption applications yet.
                            </p>
                            <button
                                onClick={() => navigate('/pets')}
                                className="px-8 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition"
                            >
                                Browse Pets
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {applications.map((app) => (
                                <div
                                    key={app.id}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
                                >
                                    <div className="md:flex">
                                        {/* Pet Image */}
                                        <div className="md:w-48 h-48 md:h-auto">
                                            <img
                                                src={app.pet_image}
                                                alt={app.pet_name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Application Details */}
                                        <div className="flex-1 p-6">
                                            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                                <div>
                                                    <h3 className="text-2xl font-playfair font-bold text-accent-900 mb-1">
                                                        {app.pet_name}
                                                    </h3>
                                                    <p className="text-accent-600">
                                                        {app.pet_breed} • {app.pet_age}
                                                    </p>
                                                </div>
                                                <StatusBadge status={app.status} />
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
                                                <div>
                                                    <span className="text-accent-500">Submitted:</span>{' '}
                                                    <span className="text-accent-900 font-medium">
                                                        {format(new Date(app.created_at), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-accent-500">Last Updated:</span>{' '}
                                                    <span className="text-accent-900 font-medium">
                                                        {format(new Date(app.updated_at), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    onClick={() => navigate(`/applications/${app.id}`)}
                                                    className="px-6 py-2 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition text-sm"
                                                >
                                                    View Details
                                                </button>

                                                {(app.status === 'pending' || app.status === 'under_review') && (
                                                    <button
                                                        onClick={() => handleWithdraw(app.id)}
                                                        className="px-6 py-2 border border-red-300 text-red-700 rounded-full hover:bg-red-50 transition text-sm"
                                                    >
                                                        Withdraw
                                                    </button>
                                                )}

                                                {app.status === 'approved' && (
                                                    <div className="flex items-center text-green-700 text-sm">
                                                        <span className="mr-2">✓</span>
                                                        Your application has been approved! The shelter will contact you soon.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
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
