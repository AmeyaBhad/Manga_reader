import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Play, SkipForward, Heart, Star, BookOpen, ChevronDown, MessageSquare } from 'lucide-react';
import { mangaAPI, chapterAPI, favoriteAPI, followsAPI, usersAPI, forumsAPI } from '../api';
import { useAuth } from '../AuthContext';

const STATUS_OPTIONS = [
  { value: 'reading', label: 'Reading', color: 'var(--green)' },
  { value: 'completed', label: 'Completed', color: 'var(--blue)' },
  { value: 'on_hold', label: 'On Hold', color: 'var(--yellow)' },
  { value: 'dropped', label: 'Dropped', color: 'var(--red)' },
  { value: 'plan_to_read', label: 'Plan to Read', color: 'var(--purple)' },
];

export default function MangaDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [followStatus, setFollowStatus] = useState(null);
  const [showFollowMenu, setShowFollowMenu] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [ratingStats, setRatingStats] = useState({ avgRating: 0, count: 0 });
  const [descExpanded, setDescExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [threads, setThreads] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([mangaAPI.getDetails(id), chapterAPI.getChapters(id)])
      .then(([m, ch]) => { setManga(m.data); setChapters(ch.data.data); })
      .catch(console.error).finally(() => setLoading(false));
    forumsAPI.getThreads(null, id).then(r => setThreads(r.data.data.slice(0, 5))).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    favoriteAPI.isFavorite(id).then(r => setIsFav(r.data.isFavorite)).catch(() => {});
    followsAPI.getStatus(id).then(r => setFollowStatus(r.data.following ? r.data.status : null)).catch(() => {});
    usersAPI.getMangaRating(id).then(r => { setUserRating(r.data.userRating); setRatingStats({ avgRating: r.data.avgRating, count: r.data.count }); }).catch(() => {});
  }, [id, isAuthenticated]);

  const toggleFav = async () => {
    if (!isAuthenticated) return alert('Login required');
    try { isFav ? await favoriteAPI.remove(id) : await favoriteAPI.add(id); setIsFav(!isFav); } catch {}
  };

  const setFollow = async (status) => {
    if (!isAuthenticated) return alert('Login required');
    try {
      if (followStatus && status === followStatus) { await followsAPI.unfollow(id); setFollowStatus(null); }
      else { await followsAPI.follow(id, status); setFollowStatus(status); }
    } catch {}
    setShowFollowMenu(false);
  };

  const rate = async (r) => {
    if (!isAuthenticated) return alert('Login required');
    try {
      await usersAPI.rateManga(id, r); setUserRating(r);
      const res = await usersAPI.getMangaRating(id);
      setRatingStats({ avgRating: res.data.avgRating, count: res.data.count });
    } catch {}
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!manga) return <div className="empty"><h3>Manga not found</h3></div>;

  const followLabel = followStatus ? STATUS_OPTIONS.find(s => s.value === followStatus)?.label : 'Add to Library';

  return (
    <div>
      <div className="manga-detail-hero">
        <div className="manga-detail-cover">
          <img src={manga.cover} alt={manga.title} onError={e => e.target.src='https://placehold.co/220x330/1a1a1a/666?text=No+Cover'} />
        </div>
        <div className="manga-detail-info">
          <h1 className="manga-detail-title">{manga.title}</h1>
          <div className="manga-detail-meta">
            {manga.status && <span className="meta-chip">{manga.status}</span>}
            {manga.year && <span className="meta-chip">{manga.year}</span>}
            {manga.contentRating && <span className="meta-chip">{manga.contentRating}</span>}
            {manga.authors?.length > 0 && <span className="meta-chip">{manga.authors.join(', ')}</span>}
          </div>

          <div className={`manga-detail-desc ${descExpanded ? 'expanded' : ''}`}>
            {manga.description || 'No description available.'}
          </div>
          {manga.description?.length > 200 && (
            <button className="read-more-btn" onClick={() => setDescExpanded(!descExpanded)}>
              {descExpanded ? 'Show less' : 'Read more'}
            </button>
          )}

          <div className="manga-actions">
            {chapters.length > 0 && (
              <Link to={`/reader/${id}/${chapters[chapters.length-1].id}`} className="btn-accent"
                style={{ padding: '9px 18px', borderRadius: '4px', fontWeight: 600, display:'flex', alignItems:'center', gap:'6px' }}>
                <Play size={15} /> Start Reading
              </Link>
            )}
            {chapters.length > 0 && (
              <Link to={`/reader/${id}/${chapters[0].id}`} className="btn-blue"
                style={{ padding: '9px 18px', borderRadius: '4px', fontWeight: 600, display:'flex', alignItems:'center', gap:'6px' }}>
                <SkipForward size={15} /> Latest
              </Link>
            )}

            <div className="follow-dropdown">
              <button onClick={() => setShowFollowMenu(!showFollowMenu)}
                className={followStatus ? 'btn-blue' : 'btn-ghost'}
                style={{ padding: '9px 18px', borderRadius: '4px', display:'flex', alignItems:'center', gap:'6px' }}>
                <BookOpen size={15} /> {followLabel} <ChevronDown size={14} />
              </button>
              {showFollowMenu && (
                <div className="follow-menu">
                  {STATUS_OPTIONS.map(opt => (
                    <div key={opt.value} className={`follow-option ${opt.cls}`}
                      onClick={() => setFollow(opt.value)}
                      style={{ color: followStatus === opt.value ? opt.color : undefined }}>
                      {opt.label} {followStatus === opt.value && '✓'}
                    </div>
                  ))}
                  {followStatus && (
                    <div className="follow-option" style={{ color:'var(--text3)' }}
                      onClick={() => { followsAPI.unfollow(id); setFollowStatus(null); setShowFollowMenu(false); }}>
                      Remove
                    </div>
                  )}
                </div>
              )}
            </div>

            <button onClick={toggleFav}
              className={isFav ? 'btn-accent' : 'btn-ghost'}
              style={{ padding: '9px 14px', borderRadius: '4px', display:'flex', alignItems:'center' }}>
              <Heart size={16} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className="rating-display">
            <span style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>Your rating:</span>
            {[...Array(10)].map((_, i) => (
              <button key={i+1} onClick={() => rate(i+1)} style={{
                background: 'none', border: 'none',
                color: userRating >= i+1 ? 'var(--yellow)' : 'var(--text3)',
                cursor: 'pointer', padding: '2px', display:'flex', alignItems:'center'
              }}>
                <Star size={14} fill={userRating >= i+1 ? 'currentColor' : 'none'} />
              </button>
            ))}
            {ratingStats.count > 0 && (
              <span style={{ color: 'var(--text2)', fontSize: '0.85rem', marginLeft: '4px' }}>
                {ratingStats.avgRating}/10 ({ratingStats.count})
              </span>
            )}
          </div>

          {manga.tags?.length > 0 && (
            <div className="tag-list" style={{ marginTop: '14px' }}>
              {manga.tags.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
          )}
        </div>
      </div>

      <div className="divider" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
          <div className="chapter-list-header">
            <h3 style={{ color: 'var(--text)', display:'flex', alignItems:'center', gap:'6px' }}>
              <BookOpen size={16} /> Chapters ({chapters.length})
            </h3>
          </div>
          {chapters.length === 0 ? (
            <div className="empty"><h3>No chapters available</h3></div>
          ) : chapters.map(ch => (
            <div key={ch.id} className="chapter-item">
              <Link to={`/reader/${id}/${ch.id}`} className="chapter-link">
                {ch.title || `Chapter ${ch.chapterNumber}`}
              </Link>
              <span className="chapter-date">{new Date(ch.publishedAt).toLocaleDateString()}</span>
            </div>
          ))}
        </div>

        <div>
          <div className="chapter-list-header">
            <h3 style={{ color: 'var(--text)', display:'flex', alignItems:'center', gap:'6px' }}>
              <MessageSquare size={16} /> Discussions
            </h3>
          </div>
          {threads.map(t => (
            <Link to={`/forums/${t.id}`} key={t.id} style={{ display:'block', padding:'10px', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'4px', marginBottom:'6px', textDecoration:'none' }}>
              <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text)', marginBottom:'4px' }}>{t.title}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text3)' }}>by {t.username} · {t.reply_count} replies</div>
            </Link>
          ))}
          <Link to={`/forums`} style={{ fontSize:'0.85rem', color:'var(--accent2)' }}>View all discussions →</Link>
        </div>
      </div>
    </div>
  );
}
