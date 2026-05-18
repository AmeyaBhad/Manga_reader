import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Eye, MessageCircle } from 'lucide-react';
import { forumsAPI } from '../api';
import { useAuth } from '../AuthContext';

const CATS = ['general', 'manga', 'question', 'news'];

export default function Forums() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [newCat, setNewCat] = useState('general');
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => { load(); }, [cat]);

  const load = () => {
    setLoading(true);
    forumsAPI.getThreads(cat || undefined).then(r => setThreads(r.data.data)).catch(console.error).finally(() => setLoading(false));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;
    try { await forumsAPI.createThread(title, content, newCat); setTitle(''); setContent(''); setShowNew(false); load(); } catch {}
  };

  const timeAgo = (d) => {
    const diff = Math.floor((new Date() - new Date(d)) / 1000);
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <h1 className="page-title" style={{ margin:0 }}>Forums</h1>
        {isAuthenticated && (
          <button className="btn-blue" style={{ padding:'8px 14px', borderRadius:'4px', display:'flex', alignItems:'center', gap:'6px' }} onClick={() => setShowNew(!showNew)}>
            <Plus size={16} /> New Thread
          </button>
        )}
      </div>

      {showNew && (
        <form onSubmit={submit} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px', marginBottom:'20px' }}>
          <div style={{ marginBottom:'10px' }}><input className="form-input" placeholder="Thread title..." value={title} onChange={e => setTitle(e.target.value)} required /></div>
          <div style={{ marginBottom:'10px' }}>
            <select className="form-input" value={newCat} onChange={e => setNewCat(e.target.value)}>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom:'10px' }}><textarea className="form-input" placeholder="Thread content..." value={content} onChange={e => setContent(e.target.value)} rows={4} required /></div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button type="submit" className="btn-blue" style={{ padding:'8px 16px', borderRadius:'4px' }}>Post</button>
            <button type="button" className="btn-ghost" style={{ padding:'8px 16px', borderRadius:'4px' }} onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div style={{ display:'flex', gap:'6px', marginBottom:'16px', flexWrap:'wrap' }}>
        {['', ...CATS].map(c => (
          <button key={c} onClick={() => setCat(c)}
            style={{ padding:'6px 14px', borderRadius:'4px', border:'1px solid var(--border)', background: cat===c ? 'var(--accent2)' : 'var(--bg2)', color: cat===c ? 'white' : 'var(--text2)', cursor:'pointer', fontSize:'0.85rem', transition:'all 0.2s' }}>
            {c || 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="loading"><div className="spinner" /></div> : (
        threads.length === 0 ? <div className="empty"><h3>No threads yet</h3></div> :
        threads.map(t => (
          <Link to={`/forums/${t.id}`} key={t.id} style={{ textDecoration:'none' }}>
            <div className="thread-item">
              <div className="thread-body">
                <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'6px' }}>
                  <span className={`category-badge cat-${t.category}`}>{t.category}</span>
                  <span className="thread-title">{t.title}</span>
                </div>
                <div className="thread-meta">
                  <span>by {t.username}</span>
                  <span>{timeAgo(t.created_at)}</span>
                </div>
              </div>
              <div className="thread-stats">
                <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><Eye size={13} /> {t.views}</span>
                <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><MessageCircle size={13} /> {t.reply_count}</span>
              </div>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
