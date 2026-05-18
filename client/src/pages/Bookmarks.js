import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Trash2, ExternalLink } from 'lucide-react';
import { bookmarkAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    bookmarkAPI.getAll().then(r => setBookmarks(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const remove = async (id) => {
    try { await bookmarkAPI.delete(id); setBookmarks(bookmarks.filter(b => b.id !== id)); } catch {}
  };

  if (!isAuthenticated) return <div className="empty"><h3>Login to see bookmarks</h3><Link to="/login" style={{ color:'var(--accent2)' }}>Login</Link></div>;
  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:'8px' }}><Bookmark size={22} /> Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <div className="empty"><h3>No bookmarks yet</h3><p>Bookmark pages while reading</p></div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'12px' }}>
          {bookmarks.map(b => (
            <div key={b.id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'14px', display:'flex', gap:'12px' }}>
              {b.cover_url && <img src={b.cover_url} alt={b.title} style={{ width:'56px', height:'80px', objectFit:'cover', borderRadius:'4px', flexShrink:0 }} onError={e => e.target.src='https://placehold.co/56x80/1a1a1a/666?text=?'} />}
              <div style={{ flex:1, minWidth:0 }}>
                <Link to={`/manga/${b.manga_id}`} style={{ fontWeight:600, color:'var(--text)', fontSize:'0.9rem', display:'block', marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{b.title}</Link>
                <div style={{ fontSize:'0.8rem', color:'var(--text2)', marginBottom:'2px' }}>{b.chapter_title}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginBottom:'8px' }}>Page {b.page_number}</div>
                <div style={{ display:'flex', gap:'6px' }}>
                  <Link to={`/reader/${b.manga_id}/${b.chapter_id}`} className="btn-blue" style={{ padding:'5px 10px', borderRadius:'4px', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'4px' }}>
                    <ExternalLink size={12} /> Continue
                  </Link>
                  <button onClick={() => remove(b.id)} className="btn-ghost" style={{ padding:'5px 10px', borderRadius:'4px', fontSize:'0.8rem', display:'flex', alignItems:'center', gap:'4px', color:'var(--red)' }}>
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
