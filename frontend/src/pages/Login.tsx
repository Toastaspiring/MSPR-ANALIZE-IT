import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', {
        email: form.email,
        password: form.password
      });
      // Stocker le token et les infos utilisateur
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // Rediriger selon le rôle
      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else if (res.data.user.role === 'superadmin') {
        navigate('/superadmin');
      } else {
        navigate('/'); // page d'accueil ou dashboard user
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 32, border: '1px solid #eee', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{t('auth.login')}</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>{t('auth.email')} :</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>{t('auth.password')} :</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1976d2', color: 'white', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
          {loading ? t('common.loading') : t('auth.login')}
        </button>
      </form>
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <span>{t('auth.dontHaveAccount')} </span>
        <Link to="/register" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>{t('auth.register')}</Link>
      </div>
    </div>
  );
};

export default Login; 