import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Sparkles, Clock, ChevronLeft, ChevronRight, Star, History } from 'lucide-react';
import { mangaAPI, feedAPI, usersAPI, chapterAPI } from '../api';
import { useAuth } from '../AuthContext';

// ── Featured Carousel ──────────────────────────────────────────
function FeaturedCarousel({ items, usingRatings }) {
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % items.length), 5000);
  };

  useEffect(() => { resetTimer(); return () => clearInterval(timerRef.current); }, [items.length]);
  const goTo = (n) => { setIdx((n + items.length) % items.length); resetTimer(); };

  if (!items.length) return null;
  const m = items[idx];

  return (
    <div style={{
      position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 28, height: 280,
      boxShadow: 'var(--shadow)',
      animation: 'fadeIn 0.4s ease'
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${m.cover})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        filter: 'blur(22px) brightness(0.4)',
        transform: 'scale(1.15)',
        transition: 'background-image 0.6s ease, filter 0.4s'
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to right, rgba(0,0,0,0.15), rgba(0,0,0,0.7))'
      }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 24, padding: 28, height: '100%' }}>
        <Link to={`/manga/${m.id}`} style={{ flexShrink: 0, transition: 'transform 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <img src={m.cover} alt={m.title} style={{ height: 225, width: 'auto', borderRadius: 8, boxShadow: '0 12px 32px rgba(0,0,0,0.6)', display: 'block' }} onError={e => e.target.src = 'https://placehold.co/140x210/1a1a1a/666?text=No+Cover'} />
        </Link>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
            {usingRatings ? <><Star size={11} fill="currentColor" /> Popular This Week · Community Rated</> : <><TrendingUp size={11} /> Popular This Week · Trending</>}
          </p>
          <Link to={`/manga/${m.id}`}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.title}</h2>
          </Link>
          {m.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
              {m.tags.slice(0, 4).map(t => <span key={t} style={{ background: 'rgba(255,255,255,0.13)', color: '#fff', padding: '2px 9px', borderRadius: 3, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>{t}</span>)}
            </div>
          )}
          {m.description && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.83rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{m.description}</p>}
          {m.authors?.length > 0 && <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginTop: 8 }}>{m.authors.join(', ')}</p>}
          {m.avg_rating > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
              <Star size={13} fill="#ffc107" color="#ffc107" />
              <span style={{ color: '#ffc107', fontWeight: 700, fontSize: '0.88rem' }}>{m.avg_rating}</span>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.75rem' }}>/ 10 · {m.vote_count} votes</span>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '1px' }}>NO. {idx + 1}</span>
          <div style={{ display: 'flex', gap: 5 }}>
            {[ChevronLeft, ChevronRight].map((Icon, di) => (
              <button key={di} onClick={() => goTo(idx + (di === 0 ? -1 : 1))}
                style={{ background: 'rgba(255,255,255,0.13)', border: 'none', color: '#fff', borderRadius: 4, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.13)'}
              ><Icon size={15} /></button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, marginTop: 2 }}>
            {items.map((_, i) => <button key={i} onClick={() => goTo(i)} style={{ width: i === idx ? 16 : 6, height: 6, borderRadius: 3, border: 'none', background: i === idx ? '#fff' : 'rgba(255,255,255,0.25)', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Home ───────────────────────────────────────────────────────
export default function Home() {
  const { isAuthenticated } = useAuth();
  const [featured, setFeatured] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [recent, setRecent] = useState([]);
  const [history, setHistory] = useState([]);
  const [usingRatings, setUsingRatings] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      mangaAPI.getTrending(12),
      feedAPI.getLatest(48),
      feedAPI.getRecentlyAdded(6),
      usersAPI.getPopularThisWeek(10),
    ]).then(([t, l, r, pop]) => {
      setTrending(t.data.data);
      setRecent(r.data.data);

      // Deduplicate latest — one entry per manga (most recent chapter only)
      const seen = new Set();
      const deduped = (l.data.data || []).filter(ch => {
        if (!ch.mangaId || seen.has(ch.mangaId)) return false;
        seen.add(ch.mangaId);
        return true;
      }).slice(0, 20);
      setLatest(deduped);

      const rated = pop.data.data || [];
      if (rated.length >= 3) {
        setUsingRatings(true);
        const mapped = rated.map(m => ({ id: m.manga_id, title: m.title, cover: m.cover_url, status: m.status, description: m.description, avg_rating: m.avg_rating, vote_count: m.vote_count }));
        setFeatured(mapped);
        Promise.all(mapped.map(m => mangaAPI.getDetails(m.id).then(r => ({ ...r.data, avg_rating: m.avg_rating, vote_count: m.vote_count })).catch(() => m))).then(full => setFeatured(full));
      } else {
        const base = t.data.data.slice(0, 10);
        setFeatured(base);
        Promise.all(base.map(m => mangaAPI.getDetails(m.id).then(r => r.data).catch(() => m))).then(full => setFeatured(full));
      }
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // History — unique manga only
  useEffect(() => {
    if (!isAuthenticated) return;
    chapterAPI.getHistory().then(r => setHistory(r.data.data || [])).catch(() => {});
  }, [isAuthenticated]);

  const statusClass = s => ({ ongoing: 'status-ongoing', completed: 'status-completed', hiatus: 'status-hiatus', cancelled: 'status-cancelled' }[s] || 'status-ongoing');

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

  if (loading) return <div className="loading"><div className="spinner" /><p>Loading...</p></div>;

  return (
    <div>
      {/* Featured */}
      <FeaturedCarousel items={featured} usingRatings={usingRatings} />

      {/* Trending */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={17} /> Trending</h2>
          <Link to="/search" className="section-link">View all →</Link>
        </div>
        <div className="manga-grid">
          {trending.map(m => (
            <Link to={`/manga/${m.id}`} key={m.id} className="manga-card">
              <img src={m.cover} alt={m.title} className="manga-cover" onError={e => e.target.src = 'https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />
              <div className="manga-info">
                <div className="manga-title">{m.title}</div>
                {m.status && <span className={`manga-status-badge ${statusClass(m.status)}`}>{m.status}</span>}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recently Added + History */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, marginBottom: 28 }}>
        {/* Recently Added */}
        <div>
          <div className="section-header">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Sparkles size={17} /> Recently Added</h2>
            <Link to="/recently-added" className="section-link">View all →</Link>
          </div>
          <div className="manga-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
            {recent.map(m => (
              <Link to={`/manga/${m.id}`} key={m.id} className="manga-card">
                <img src={m.cover} alt={m.title} className="manga-cover" onError={e => e.target.src = 'https://placehold.co/120x180/1a1a1a/666?text=No+Cover'} />
                <div className="manga-info"><div className="manga-title">{m.title}</div></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Reading History (right side) */}
        <div>
          <div className="section-header">
            <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><History size={17} /> Continue Reading</h2>
            {isAuthenticated && <Link to="/history" className="section-link">View all →</Link>}
          </div>
          {!isAuthenticated ? (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text3)', fontSize: '0.85rem', marginBottom: 10 }}>Login to track your reading history</p>
              <Link to="/login" className="btn-blue" style={{ padding: '7px 16px', borderRadius: 4, display: 'inline-block', fontSize: '0.85rem' }}>Login</Link>
            </div>
          ) : history.length === 0 ? (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 6, padding: '20px 16px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text3)', fontSize: '0.85rem' }}>No reading history yet</p>
            </div>
          ) : (
            <div className="feed-list">
              {history.slice(0, 8).map(h => (
                <Link to={`/manga/${h.manga_id}`} key={h.manga_id} className="feed-item" style={{ textDecoration: 'none', gap: 10 }}>
                  {h.cover_url && <img src={h.cover_url} alt={h.title} className="feed-cover" onError={e => e.target.src = 'https://placehold.co/36x50/1a1a1a/666?text=?'} />}
                  <div className="feed-info">
                    <div className="feed-manga">{h.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Page {h.page_number || 1}</div>
                  </div>
                  <div className="feed-time">{timeAgo(h.last_read)}</div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Latest Updates — full width */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={17} /> Latest Updates</h2>
          <Link to="/feed" className="section-link">View all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: 'var(--border)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          {latest.map(ch => (
            <div key={ch.id} className="feed-item" style={{ background: 'var(--bg2)' }}>
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
  );
}
