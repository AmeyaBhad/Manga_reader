import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Rss, Sparkles, LogIn } from 'lucide-react';
import { feedAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function Feed({ mode }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const isRecent = mode === 'recent';

  useEffect(() => {
    setLoading(true);
    let req;
    if (isRecent) {
      req = feedAPI.getRecentlyAdded(24);
    } else if (isAuthenticated) {
      // Feed = only chapters from manga the user follows
      req = feedAPI.getMyFeed();
    } else {
      req = Promise.resolve({ data: { data: [] } });
    }
    req.then(r => setItems(r.data.data || [])).catch(console.error).finally(() => setLoading(false));
  }, [mode, isAuthenticated]);

  const timeAgo = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Unknown';
    const diff = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diff < 0) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
    return `${Math.floor(diff / 2592000)}mo ago`;
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  // Recently Added grid view
  if (isRecent) return (
    <div>
      <div className="section-header" style={{ marginBottom: 20 }}>
        <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={20} /> Recently Added</h1>
      </div>
      <div className="manga-grid">
        {items.map(m => (
          <Link to={`/manga/${m.id}`} key={m.id} className="manga-card">
            <img src={m.cover} alt={m.title} className="manga-cover" onError={e => e.target.src = 'https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />
            <div className="manga-info">
              <div className="manga-title">{m.title}</div>
              <div className="manga-meta">{timeAgo(m.createdAt)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );

  // Feed — requires login + follows
  if (!isAuthenticated) return (
    <div>
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Rss size={20} /> My Feed</h1>
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '40px 24px', textAlign: 'center', marginTop: 24 }}>
        <Rss size={40} color="var(--text3)" style={{ marginBottom: 12 }} />
        <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>Login to see your feed</h3>
        <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginBottom: 20 }}>
          Your feed shows new chapters from manga you follow
        </p>
        <Link to="/login" className="btn-blue" style={{ padding: '9px 20px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: '0.9rem' }}>
          <LogIn size={16} /> Login
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}><Rss size={20} /> My Feed</h1>
      <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginBottom: 20 }}>
        New chapters from manga you follow
      </p>

      {items.length === 0 ? (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '40px 24px', textAlign: 'center' }}>
          <Rss size={40} color="var(--text3)" style={{ marginBottom: 12 }} />
          <h3 style={{ color: 'var(--text)', marginBottom: 8 }}>Your feed is empty</h3>
          <p style={{ color: 'var(--text3)', fontSize: '0.9rem', marginBottom: 20 }}>
            Follow some manga to see new chapter updates here
          </p>
          <Link to="/search" className="btn-blue" style={{ padding: '9px 20px', borderRadius: 4, display: 'inline-block', fontSize: '0.9rem' }}>
            Browse Manga
          </Link>
        </div>
      ) : (
        <div className="feed-list">
          {items.map(ch => (
            <Link to={ch.mangaId ? `/manga/${ch.mangaId}` : '#'} key={ch.id} className="feed-item" style={{ textDecoration: 'none' }}>
              <div className="feed-info">
                <div className="feed-manga">{ch.mangaTitle || 'Unknown Manga'}</div>
                <div className="feed-chapter">Chapter {ch.chapter}{ch.title ? ` — ${ch.title}` : ''}</div>
              </div>
              <div className="feed-time">{timeAgo(ch.publishedAt)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
