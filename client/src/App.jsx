import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Pets from './pages/Pets';
import HowItWorksPage from './pages/HowItWorksPage';

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
                <Route path="/profile" element={<Profile />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/pets" element={<Pets />} />
              </Routes>
            </div>
          </BrowserRouter>
        </FavoritesProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

export default App;
