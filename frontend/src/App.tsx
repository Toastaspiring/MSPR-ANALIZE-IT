import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminPage from './pages/AdminPage';
import SuperAdminPage from './pages/SuperAdminPage';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
  const [userCountry, setUserCountry] = useState<'France' | 'Suisse' | 'US'>('Suisse');

  // Mettre à jour le pays quand l'utilisateur change
  useEffect(() => {
    const updateUserCountry = () => {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.country) {
        setUserCountry(user.country);
      }
    };

    // Mettre à jour au montage
    updateUserCountry();

    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      updateUserCountry();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Écouter les changements de localStorage dans le même onglet
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, [key, value]);
      if (key === 'user') {
        updateUserCountry();
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  return (
    <LanguageProvider userCountry={userCountry}>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute allowedRoles={['user', 'admin', 'superadmin']}>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminPage />
            </PrivateRoute>
          } />
          <Route path="/superadmin" element={
            <PrivateRoute allowedRoles={['superadmin']}>
              <SuperAdminPage />
            </PrivateRoute>
          } />
          <Route path="*" element={<div>Page non trouvée</div>} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}

export default App;
