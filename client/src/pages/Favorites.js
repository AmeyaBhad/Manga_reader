import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, X } from 'lucide-react';
import { favoriteAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function Favorites() {
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    favoriteAPI.getAll().then(r => setFavs(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const remove = async (mangaId) => {
    try { await favoriteAPI.remove(mangaId); setFavs(favs.filter(f => f.id !== mangaId)); } catch {}
  };

  if (!isAuthenticated) return <div className="empty"><h3>Login to see favorites</h3><Link to="/login" style={{ color:'var(--accent2)' }}>Login</Link></div>;
  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:'8px' }}><Heart size={22} /> Favorites</h1>
      {favs.length === 0 ? (
        <div className="empty"><h3>No favorites yet</h3><Link to="/search" className="btn-blue" style={{ display:'inline-block', marginTop:'12px', padding:'8px 16px', borderRadius:'4px' }}>Explore</Link></div>
      ) : (
        <div className="manga-grid">
          {favs.map(m => (
            <div key={m.id} className="manga-card" style={{ position:'relative' }}>
              <button onClick={(e) => { e.preventDefault(); remove(m.id); }}
                style={{ position:'absolute', top:'6px', right:'6px', background:'rgba(0,0,0,0.7)', border:'none', color:'white', borderRadius:'50%', width:'24px', height:'24px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1 }}>
                <X size={14} />
              </button>
              <Link to={`/manga/${m.id}`} style={{ display:'contents' }}>
                {m.cover_url && <img src={m.cover_url} alt={m.title} className="manga-cover" onError={e => e.target.src='https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />}
                <div className="manga-info">
                  <div className="manga-title">{m.title}</div>
                  {m.status && <span className={`manga-status-badge status-${m.status}`}>{m.status}</span>}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
