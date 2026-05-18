import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit2, Check, X, BookOpen, Clock } from 'lucide-react';
import { usersAPI, followsAPI, chapterAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [follows, setFollows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [tab, setTab] = useState('reading');
  const { user, isAuthenticated } = useAuth();
  const isOwn = user?.id === parseInt(id);

  useEffect(() => {
    Promise.all([usersAPI.getById(id), followsAPI.getAll()])
      .then(([p, f]) => { setProfile(p.data); setFollows(f.data.data); setBio(p.data.bio || ''); })
      .catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const saveProfile = async () => {
    await usersAPI.updateProfile(bio);
    setProfile({ ...profile, bio });
    setEditing(false);
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!profile) return <div className="empty"><h3>User not found</h3></div>;

  const readingList = follows.filter(f => f.status === tab);

  return (
    <div>
      <div className="profile-header">
        <div className="profile-avatar">{profile.username[0].toUpperCase()}</div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:'1.6rem', marginBottom:'4px' }}>{profile.username}</h1>
          {editing ? (
            <div style={{ display:'flex', gap:'8px', marginTop:'8px', alignItems:'center' }}>
              <input className="form-input" value={bio} onChange={e => setBio(e.target.value)} placeholder="Write your bio..." style={{ flex:1 }} />
              <button style={{ background:'none', border:'none', color:'var(--green)', cursor:'pointer' }} onClick={saveProfile}><Check size={18} /></button>
              <button style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer' }} onClick={() => setEditing(false)}><X size={18} /></button>
            </div>
          ) : (
            <p style={{ color:'var(--text2)', margin:'4px 0 8px', fontSize:'0.9rem' }}>{profile.bio || 'No bio yet'}</p>
          )}
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="profile-stat-value" style={{ display:'flex', alignItems:'center', gap:'4px', justifyContent:'center' }}><BookOpen size={16} /> {follows.length}</div>
              <div className="profile-stat-label">Library</div>
            </div>
            <div className="profile-stat">
              <div className="profile-stat-value" style={{ display:'flex', alignItems:'center', gap:'4px', justifyContent:'center' }}><Clock size={16} /> {profile.read_count || 0}</div>
              <div className="profile-stat-label">Read</div>
            </div>
          </div>
        </div>
        {isOwn && isAuthenticated && !editing && (
          <button className="btn-ghost icon-btn" style={{ padding:'7px 14px', borderRadius:'4px', fontSize:'0.85rem' }} onClick={() => setEditing(true)}>
            <Edit2 size={14} /> Edit
          </button>
        )}
      </div>

      <h3 style={{ marginBottom:'12px' }}>Library</h3>
      <div className="status-tabs" style={{ marginBottom:'16px' }}>
        {['reading','completed','on_hold','dropped','plan_to_read'].map(s => (
          <button key={s} className={`status-tab ${tab===s ? 'active' : ''}`} onClick={() => setTab(s)}>
            {s.replace('_',' ')}
            <span className="status-count">{follows.filter(f => f.status===s).length}</span>
          </button>
        ))}
      </div>
      {readingList.length === 0 ? (
        <div className="empty"><h3>Nothing in {tab.replace('_',' ')}</h3></div>
      ) : (
        <div className="manga-grid">
          {readingList.map(f => (
            <Link to={`/manga/${f.manga_id}`} key={f.manga_id} className="manga-card">
              {f.cover_url && <img src={f.cover_url} alt={f.title} className="manga-cover" onError={e => e.target.src='https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />}
              <div className="manga-info"><div className="manga-title">{f.title}</div></div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
