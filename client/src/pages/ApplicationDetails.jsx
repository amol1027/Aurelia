import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import StatusBadge from '../components/StatusBadge';
import { format } from 'date-fns';

export default function ApplicationDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchApplication();
    }, [id, user, navigate]);

    const fetchApplication = async () => {
        try {
            const token = localStorage.getItem('aurelia_token');
            const response = await fetch(`http://localhost:5000/api/adoptions/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApplication(data);
            } else {
                console.error('Failed to fetch application');
                navigate('/my-applications');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            navigate('/my-applications');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-warm-bg">
                <Navbar />
                <div className="container mx-auto px-6 py-24 text-center">
                    <p className="text-accent-700">Loading application...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!application) {
        return (
            <div className="min-h-screen bg-warm-bg">
                <Navbar />
                <div className="container mx-auto px-6 py-24 text-center">
                    <p className="text-accent-700">Application not found</p>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-warm-bg">
            <Navbar />
            
            <main className="container mx-auto px-6 py-24">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-accent-600 hover:text-accent-900 mb-6 transition"
                    >
                        <span className="mr-2">←</span> Back
                    </button>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-playfair font-bold text-accent-900 mb-2">
                                    Adoption Application for {application.pet_name}
                                </h1>
                                <p className="text-accent-600">
                                    Application #{application.id} • Submitted {format(new Date(application.created_at), 'MMMM d, yyyy')}
                                </p>
                            </div>
                            <StatusBadge status={application.status} />
                        </div>
                    </div>

                    {/* Pet Info */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xl font-playfair font-bold text-accent-900 mb-4">Pet Information</h2>
                        <div className="flex gap-6">
                            <img
                                src={application.pet_image}
                                alt={application.pet_name}
                                className="w-32 h-32 object-cover rounded-xl"
                            />
                            <div>
                                <h3 className="text-2xl font-playfair font-bold text-accent-900 mb-1">
                                    {application.pet_name}
                                </h3>
                                <p className="text-accent-600 mb-2">{application.pet_breed} • {application.pet_age}</p>
                                <p className="text-accent-700">{application.pet_description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Home Environment */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xl font-playfair font-bold text-accent-900 mb-4">Home Environment</h2>
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-accent-500">Home Type:</span>{' '}
                                <span className="text-accent-900 font-medium capitalize">{application.home_type}</span>
                            </div>
                            <div>
                                <span className="text-accent-500">Ownership:</span>{' '}
                                <span className="text-accent-900 font-medium capitalize">{application.home_ownership}</span>
                            </div>
                            <div>
                                <span className="text-accent-500">Has Yard:</span>{' '}
                                <span className="text-accent-900 font-medium">{application.has_yard ? 'Yes' : 'No'}</span>
                            </div>
                            {application.has_yard && (
                                <div>
                                    <span className="text-accent-500">Yard Fenced:</span>{' '}
                                    <span className="text-accent-900 font-medium">{application.yard_fenced ? 'Yes' : 'No'}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Other Pets & Children */}
                    {(application.has_other_pets || application.has_children) && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                            <h2 className="text-xl font-playfair font-bold text-accent-900 mb-4">Household</h2>
                            {application.has_other_pets && (
                                <div className="mb-4">
                                    <h3 className="text-accent-700 font-medium mb-2">Other Pets:</h3>
                                    <p className="text-accent-900">{application.other_pets_details}</p>
                                </div>
                            )}
                            {application.has_children && (
                                <div>
                                    <h3 className="text-accent-700 font-medium mb-2">Children Ages:</h3>
                                    <p className="text-accent-900">{application.children_ages}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Experience */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xl font-playfair font-bold text-accent-900 mb-4">Pet Experience</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-accent-700 font-medium mb-2">Experience:</h3>
                                <p className="text-accent-900 whitespace-pre-line">{application.pet_experience}</p>
                            </div>
                            {application.previous_pets && (
                                <div>
                                    <h3 className="text-accent-700 font-medium mb-2">Previous Pets:</h3>
                                    <p className="text-accent-900 whitespace-pre-line">{application.previous_pets}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* References */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xl font-playfair font-bold text-accent-900 mb-4">References</h2>
                        <div className="space-y-4 text-sm">
                            {application.vet_reference && (
                                <div>
                                    <h3 className="text-accent-700 font-medium mb-1">Veterinarian:</h3>
                                    <p className="text-accent-900">
                                        {application.vet_reference}
                                        {application.vet_phone && ` • ${application.vet_phone}`}
                                    </p>
                                </div>
                            )}
                            {application.personal_reference_name && (
                                <div>
                                    <h3 className="text-accent-700 font-medium mb-1">Personal Reference:</h3>
                                    <p className="text-accent-900">
                                        {application.personal_reference_name}
                                        {application.personal_reference_relationship && ` (${application.personal_reference_relationship})`}
                                        {application.personal_reference_phone && ` • ${application.personal_reference_phone}`}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Care Plan */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                        <h2 className="text-xl font-playfair font-bold text-accent-900 mb-4">Care Plan</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-accent-700 font-medium mb-2">Reason for Adoption:</h3>
                                <p className="text-accent-900 whitespace-pre-line">{application.reason_for_adoption}</p>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-accent-500">Hours Alone Per Day:</span>{' '}
                                    <span className="text-accent-900 font-medium">{application.hours_alone_per_day}</span>
                                </div>
                            </div>
                            {application.exercise_plan && (
                                <div>
                                    <h3 className="text-accent-700 font-medium mb-2">Exercise Plan:</h3>
                                    <p className="text-accent-900 whitespace-pre-line">{application.exercise_plan}</p>
                                </div>
                            )}
                            {application.special_accommodations && (
                                <div>
                                    <h3 className="text-accent-700 font-medium mb-2">Special Accommodations:</h3>
                                    <p className="text-accent-900 whitespace-pre-line">{application.special_accommodations}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status History */}
                    {application.history && application.history.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                            <h2 className="text-xl font-playfair font-bold text-accent-900 mb-4">Status History</h2>
                            <div className="space-y-4">
                                {application.history.map((entry, index) => (
                                    <div key={entry.id} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                                            {index < application.history.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-300 mt-2"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className="flex items-center gap-3 mb-1">
                                                {entry.old_status && (
                                                    <>
                                                        <StatusBadge status={entry.old_status} />
                                                        <span className="text-accent-500">→</span>
                                                    </>
                                                )}
                                                <StatusBadge status={entry.new_status} />
                                            </div>
                                            <p className="text-sm text-accent-600">
                                                {format(new Date(entry.changed_at), 'MMM d, yyyy h:mm a')}
                                                {' • '}
                                                Changed by {entry.changed_by_name}
                                            </p>
                                            {entry.notes && (
                                                <p className="text-sm text-accent-700 mt-2 p-3 bg-accent-50 rounded-lg">
                                                    {entry.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
