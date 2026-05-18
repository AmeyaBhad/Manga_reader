import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Register() {
  const [form, setForm] = useState({ username:'', email:'', password:'', confirm:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 chars');
    setLoading(true);
    try { await register(form.username, form.email, form.password); navigate('/'); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="form-card">
        <div className="form-title">Create Account</div>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {[['username','Username','text'],['email','Email','email'],['password','Password','password'],['confirm','Confirm Password','password']].map(([key, label, type]) => (
            <div className="form-group" key={key}>
              <label className="form-label">{label}</label>
              <input className="form-input" type={type} value={form[key]} onChange={set(key)} required placeholder={`Enter ${label.toLowerCase()}`} />
            </div>
          ))}
          <button type="submit" className="btn-accent btn-full" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }} disabled={loading}>
            <UserPlus size={16} /> {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign:'center', marginTop:'16px', fontSize:'0.85rem', color:'var(--text2)' }}>
          Have an account? <Link to="/login" className="form-link">Login here</Link>
        </p>
      </div>
    </div>
  );
}
