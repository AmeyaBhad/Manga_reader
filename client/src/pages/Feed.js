import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rss, Sparkles, Search } from 'lucide-react';
import { feedAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function Feed({ mode }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const isRecent = mode === 'recent';

  useEffect(() => {
    setLoading(true);
    const fn = isRecent ? feedAPI.getRecentlyAdded(24) :
      isAuthenticated ? feedAPI.getMyFeed() : feedAPI.getLatest(48);
    fn.then(r => setItems(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, [mode, isAuthenticated]);

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  const Icon = isRecent ? Sparkles : Rss;
  const title = isRecent ? 'Recently Added' : isAuthenticated ? 'My Feed' : 'Latest Updates';

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div>
      <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'20px' }}>
        <Icon size={22} /> {title}
      </h1>

      {isRecent ? (
        <div className="manga-grid">
          {items.map(m => (
            <Link to={`/manga/${m.id}`} key={m.id} className="manga-card">
              <img src={m.cover} alt={m.title} className="manga-cover" onError={e => e.target.src='https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />
              <div className="manga-info">
                <div className="manga-title">{m.title}</div>
                <div className="manga-meta">{timeAgo(m.createdAt)}</div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="feed-list">
          {items.length === 0 ? (
            <div className="empty">
              <h3>No Updates</h3>
              <p>{isAuthenticated ? 'Follow manga to see updates here' : 'No recent updates'}</p>
              <Link to="/search" className="btn-blue" style={{ display:'inline-flex', alignItems:'center', gap:'6px', marginTop:'12px', padding:'8px 16px', borderRadius:'4px', textDecoration:'none' }}>
                <Search size={15} /> Browse Manga
              </Link>
            </div>
          ) : items.map(ch => (
            <Link to={ch.mangaId ? `/manga/${ch.mangaId}` : '#'} key={ch.id} className="feed-item" style={{ textDecoration:'none' }}>
              <div className="feed-info">
                <div className="feed-manga">{ch.mangaTitle || 'Unknown Manga'}</div>
                <div className="feed-chapter">Chapter {ch.chapter} {ch.title ? `- ${ch.title}` : ''}</div>
              </div>
              <div className="feed-time">{timeAgo(ch.publishedAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
