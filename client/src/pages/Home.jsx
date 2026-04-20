import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedPets from '../components/FeaturedPets';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import CallToAction from '../components/CallToAction';
import Footer from '../components/Footer';

export default function Home({ pets }) {
    const { loading, isAuthenticated } = useAuth();

    if (loading) return null;
    if (isAuthenticated) return <Navigate to="/dashboard" replace />;
    return (
        <>
            <Navbar />
            <main>
                <Hero />
                <FeaturedPets pets={pets} />
                <HowItWorks />
                <Testimonials />
                <CallToAction />
            </main>
            <Footer />
        </>
    );
}
