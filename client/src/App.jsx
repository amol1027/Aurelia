import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Pets from './pages/Pets';
import HowItWorksPage from './pages/HowItWorksPage';
import PetDetailPage from './pages/PetDetailPage';
import MyApplications from './pages/MyApplications';
import ApplicationDetails from './pages/ApplicationDetails';
import ShelterApplicationReview from './pages/ShelterApplicationReview';
import ApplyForAdoption from './pages/ApplyForAdoption';
import PetListingsManager from './pages/PetListingsManager';
import SupportChat from './pages/SupportChat';
import AdminMessages from './pages/AdminMessages';
import UserMessages from './pages/UserMessages';

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center px-6">
      <div className="max-w-xl w-full bg-white border border-warm-border rounded-2xl p-8 text-center shadow-warm-sm">
        <p className="text-sm font-semibold text-primary-700 tracking-wide uppercase mb-3">404</p>
        <h1 className="font-heading text-3xl font-bold text-warm-text mb-3">Page Not Found</h1>
        <p className="text-warm-muted mb-8">
          The page you requested does not exist or may have been moved.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary px-6 py-2.5 text-sm">Go Home</Link>
          <Link to="/pets" className="btn-secondary px-6 py-2.5 text-sm">Browse Pets</Link>
          <Link to="/how-it-works" className="btn-secondary px-6 py-2.5 text-sm">How It Works</Link>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [pets, setPets] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/pets')
      .then((res) => res.json())
      .then((data) => setPets(data))
      .catch((err) => console.error('Failed to fetch pets:', err));
  }, []);

  return (
    <NotificationProvider>
      <AuthProvider>
        <FavoritesProvider>
          <BrowserRouter>
            <div className="min-h-screen bg-warm-bg">
              <Routes>
                <Route path="/" element={<Home pets={pets} />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/pets" element={<Pets />} />
                <Route path="/pets/:id" element={<PetDetailPage />} />
                <Route path="/my-applications" element={<MyApplications />} />
                <Route path="/applications/:id" element={<ApplicationDetails />} />
                <Route path="/shelter/applications" element={<ShelterApplicationReview />} />
                <Route path="/adopt/:id" element={<ApplyForAdoption />} />
                <Route path="/shelter/pets" element={<PetListingsManager />} />
                <Route path="/my-pets" element={<PetListingsManager />} />
                <Route path="/admin/pets" element={<PetListingsManager />} />
                <Route path="/support/chat" element={<SupportChat />} />
                <Route path="/admin/messages" element={<AdminMessages />} />
                <Route path="/messages" element={<UserMessages />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
