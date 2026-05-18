import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { followsAPI } from '../api';
import { useAuth } from '../AuthContext';

const STATUSES = [
  { value: '', label: 'All' },
  { value: 'reading', label: 'Reading', color: 'var(--green)' },
  { value: 'completed', label: 'Completed', color: 'var(--blue)' },
  { value: 'on_hold', label: 'On Hold', color: 'var(--yellow)' },
  { value: 'dropped', label: 'Dropped', color: 'var(--red)' },
  { value: 'plan_to_read', label: 'Plan to Read', color: 'var(--purple)' },
];

export default function Library() {
  const [follows, setFollows] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    followsAPI.getAll().then(r => { setFollows(r.data.data); setFiltered(r.data.data); }).catch(console.error).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const switchTab = (status) => {
    setActiveTab(status);
    setFiltered(status ? follows.filter(f => f.status === status) : follows);
  };

  const counts = STATUSES.reduce((acc, s) => {
    acc[s.value] = s.value ? follows.filter(f => f.status === s.value).length : follows.length;
    return acc;
  }, {});

  if (!isAuthenticated) return <div className="empty"><h3>Login to view your library</h3><Link to="/login" className="btn-accent" style={{ display:'inline-block', marginTop:'12px', padding:'8px 16px', borderRadius:'4px' }}>Login</Link></div>;
  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:'8px' }}><BookOpen size={22} /> My Library</h1>
      <div className="status-tabs">
        {STATUSES.map(s => (
          <button key={s.value} className={`status-tab ${activeTab === s.value ? 'active' : ''}`}
            onClick={() => switchTab(s.value)} style={activeTab === s.value && s.color ? { color: s.color, borderBottomColor: s.color } : {}}>
            {s.label}
            <span className="status-count">{counts[s.value] || 0}</span>
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="empty"><h3>Nothing here</h3><p>Follow manga to add to your library</p></div>
      ) : (
        <div className="manga-grid">
          {filtered.map(f => (
            <Link to={`/manga/${f.manga_id}`} key={f.manga_id} className="manga-card">
              {f.cover_url && <img src={f.cover_url} alt={f.title} className="manga-cover" onError={e => e.target.src='https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />}
              <div className="manga-info">
                <div className="manga-title">{f.title}</div>
                <span className={`manga-status-badge status-${f.status || 'ongoing'}`}>{(f.status || '').replace('_', ' ')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
