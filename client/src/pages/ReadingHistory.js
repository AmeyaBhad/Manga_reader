import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Search } from 'lucide-react';
import { chapterAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function ReadingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    chapterAPI.getHistory().then(r => setHistory(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const timeAgo = (d) => {
    const diff = Math.floor((new Date() - new Date(d)) / 1000);
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  if (!isAuthenticated) return <div className="empty"><h3>Login to see history</h3><Link to="/login" style={{ color:'var(--accent2)' }}>Login</Link></div>;
  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:'8px' }}><History size={22} /> Reading History</h1>
      {history.length === 0 ? (
        <div className="empty">
          <h3>No history yet</h3>
          <p>Start reading some manga!</p>
          <Link to="/search" className="btn-blue" style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'12px', padding:'8px 16px', borderRadius:'4px', textDecoration:'none' }}>
            <Search size={15} /> Browse Manga
          </Link>
        </div>
      ) : (
        <div className="manga-grid">
          {history.map(h => (
            <Link to={`/manga/${h.manga_id}`} key={h.manga_id} className="manga-card">
              {h.cover_url && <img src={h.cover_url} alt={h.title} className="manga-cover" onError={e => e.target.src='https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />}
              <div className="manga-info">
                <div className="manga-title">{h.title}</div>
                <div className="manga-meta">Page {h.page_number || 0}</div>
                <div className="manga-meta" style={{ fontSize:'0.72rem' }}>{timeAgo(h.last_read)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
