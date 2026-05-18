import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(username, password); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="form-card">
        <div className="form-title">Welcome Back</div>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" value={username} onChange={e => setUsername(e.target.value)} required placeholder="Enter username" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter password" />
          </div>
          <button type="submit" className="btn-accent btn-full" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }} disabled={loading}>
            <LogIn size={16} /> {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:'16px', fontSize:'0.85rem', color:'var(--text2)' }}>
          No account? <Link to="/register" className="form-link">Register here</Link>
        </p>
      </div>
    </div>
  );
}
