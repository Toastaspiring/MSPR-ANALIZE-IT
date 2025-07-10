import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', background: '#1976d2', color: 'white', marginBottom: 24 }}>
      <div style={{ fontWeight: 'bold', fontSize: 20, cursor: 'pointer' }} onClick={() => navigate('/')}>ANALYZE IT</div>
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LanguageSelector />
          <span>{user.first_name} {user.last_name} ({user.role})</span>
          <button onClick={handleLogout} style={{ background: 'white', color: '#1976d2', border: 'none', borderRadius: 4, padding: '6px 12px', cursor: 'pointer' }}>
            {t('auth.logout')}
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 