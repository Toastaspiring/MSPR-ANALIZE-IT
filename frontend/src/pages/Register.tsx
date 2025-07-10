import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register: React.FC = () => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    country: 'France',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationErrors([]);
    setSuccess(null);
    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/register', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        country: form.country,
        password: form.password
      });
      setSuccess('Inscription réussie ! Vous pouvez vous connecter.');
      setForm({
        first_name: '',
        last_name: '',
        email: '',
        country: 'France',
        password: '',
        confirmPassword: ''
      });
    } catch (err: any) {
      if (err.response?.data?.details) {
        // Erreurs de validation détaillées
        setValidationErrors(err.response.data.details);
      } else {
        // Erreur générale
        setError(err.response?.data?.error || "Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 32, border: '1px solid #eee', borderRadius: 12, background: '#fff', boxShadow: '0 2px 8px #0001' }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Inscription</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Prénom :</label>
          <input type="text" name="first_name" value={form.first_name} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Nom :</label>
          <input type="text" name="last_name" value={form.last_name} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Email :</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Pays d'origine :</label>
          <select name="country" value={form.country} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
            <option value="France">France</option>
            <option value="Suisse">Suisse</option>
            <option value="US">US</option>
          </select>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Mot de passe :</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Vérification du mot de passe :</label>
          <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</div>}
        {validationErrors.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: 6 }}>
            <div style={{ color: '#856404', fontWeight: 'bold', marginBottom: 8 }}>Erreurs de validation :</div>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#856404' }}>
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {success && <div style={{ color: 'green', marginBottom: 16, textAlign: 'center' }}>{success}</div>}
        <button type="submit" disabled={loading} style={{ width: '100%', padding: 10, borderRadius: 6, background: '#1976d2', color: 'white', border: 'none', fontWeight: 600, fontSize: 16, cursor: 'pointer' }}>
          {loading ? 'Inscription...' : "S'inscrire"}
        </button>
      </form>
      <div style={{ marginTop: 18, textAlign: 'center' }}>
        <span>Déjà un compte ? </span>
        <Link to="/login" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>Se connecter</Link>
      </div>
    </div>
  );
};

export default Register; 