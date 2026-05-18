import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Sparkles, Clock, Shuffle, Search } from 'lucide-react';
import { mangaAPI, feedAPI } from '../api';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([mangaAPI.getTrending(12), feedAPI.getLatest(8), feedAPI.getRecentlyAdded(6)])
      .then(([t, l, r]) => { setTrending(t.data.data); setLatest(l.data.data); setRecent(r.data.data); })
      .catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleRandom = async () => {
    try { const r = await feedAPI.getRandom(); navigate(`/manga/${r.data.id}`); } catch {}
  };

  const statusClass = (s) => ({ ongoing: 'status-ongoing', completed: 'status-completed', hiatus: 'status-hiatus', cancelled: 'status-cancelled' }[s] || 'status-ongoing');

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div>
      <div className="hero-banner">
        <div className="hero-text">
          <h1>Your Ultimate Manga Hub</h1>
          <p>Read, track and discuss manga with the community</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <Link to="/search" className="btn-accent" style={{ padding: '10px 20px', borderRadius: '4px', fontWeight: 600, display:'flex', alignItems:'center', gap:'6px' }}>
              <Search size={16} /> Browse Manga
            </Link>
            <button onClick={handleRandom} className="btn-ghost icon-btn" style={{ padding: '10px 20px' }}>
              <Shuffle size={16} /> Random
            </button>
          </div>
        </div>
      </div>

      <div className="section">
        <div className="section-header">
          <h2 className="section-title" style={{ display:'flex', alignItems:'center', gap:'8px' }}><TrendingUp size={18} /> Trending</h2>
          <Link to="/search" className="section-link">View all →</Link>
        </div>
        <div className="manga-grid">
          {trending.map(m => (
            <Link to={`/manga/${m.id}`} key={m.id} className="manga-card">
              <img src={m.cover} alt={m.title} className="manga-cover" onError={e => e.target.src='https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />
              <div className="manga-info">
                <div className="manga-title">{m.title}</div>
                {m.status && <span className={`manga-status-badge ${statusClass(m.status)}`}>{m.status}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        <div className="section">
          <div className="section-header">
            <h2 className="section-title" style={{ display:'flex', alignItems:'center', gap:'8px' }}><Sparkles size={18} /> Recently Added</h2>
            <Link to="/recently-added" className="section-link">View all →</Link>
          </div>
          <div className="manga-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {recent.map(m => (
              <Link to={`/manga/${m.id}`} key={m.id} className="manga-card">
                <img src={m.cover} alt={m.title} className="manga-cover" onError={e => e.target.src='https://placehold.co/130x195/1a1a1a/666?text=No+Cover'} />
                <div className="manga-info"><div className="manga-title">{m.title}</div></div>
              </Link>
            ))}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title" style={{ display:'flex', alignItems:'center', gap:'8px' }}><Clock size={18} /> Latest Updates</h2>
            <Link to="/feed" className="section-link">View all →</Link>
          </div>
          <div className="feed-list">
            {latest.map(ch => (
              <div key={ch.id} className="feed-item">
                <div className="feed-info">
                  <div className="feed-manga">{ch.mangaTitle || 'Unknown'}</div>
                  <div className="feed-chapter">Chapter {ch.chapter}</div>
                </div>
                <div className="feed-time">{timeAgo(ch.publishedAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
