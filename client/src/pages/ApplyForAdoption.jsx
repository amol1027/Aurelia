import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdoptionApplicationForm from '../components/AdoptionApplicationForm';

export default function ApplyForAdoption() {
    const { id } = useParams();
    const { user } = useAuth();
    const { info } = useNotification();
    const navigate = useNavigate();
    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        fetchPet();
    }, [id, user, navigate]);

    const fetchPet = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/pets/${id}`);
            if (response.ok) {
                const data = await response.json();

                if (user && Number(user.id) === Number(data.ownerUserId)) {
                    info('You cannot adopt your own pet listing');
                    navigate('/pets');
                    return;
                }

                setPet(data);
            } else {
                navigate('/pets');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            navigate('/pets');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccess = (applicationId) => {
        navigate('/my-applications');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-warm-bg">
                <Navbar />
                <div className="container mx-auto px-6 py-24 text-center">
                    <p className="text-accent-700">Loading...</p>
                </div>
                <Footer />
            </div>
        );
    }

    if (!pet) {
        return (
            <div className="min-h-screen bg-warm-bg">
                <Navbar />
                <div className="container mx-auto px-6 py-24 text-center">
                    <p className="text-accent-700">Pet not found</p>
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
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center text-accent-600 hover:text-accent-900 mb-6 transition"
                    >
                        <span className="mr-2">←</span> Back
                    </button>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
                        <div className="flex gap-6">
                            <img
                                src={pet.image}
                                alt={pet.name}
                                className="w-32 h-32 object-cover rounded-xl"
                            />
                            <div className="flex-1">
                                <h1 className="text-3xl font-playfair font-bold text-accent-900 mb-2">
                                    Apply to Adopt {pet.name}
                                </h1>
                                <p className="text-accent-600 mb-3">
                                    {pet.breed} • {pet.age}
                                </p>
                                <p className="text-accent-700">
                                    {pet.description}
                                </p>
                            </div>
                        </div>
                    </div>

                    <AdoptionApplicationForm pet={pet} onSuccess={handleSuccess} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
