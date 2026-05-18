import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { forumsAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function ThreadDetail() {
  const { id } = useParams();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    forumsAPI.getThread(id).then(r => setThread(r.data)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const postReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    try {
      await forumsAPI.reply(id, reply);
      setReply('');
      const res = await forumsAPI.getThread(id);
      setThread(res.data);
    } catch {}
  };

  const timeAgo = (d) => {
    const diff = Math.floor((new Date() - new Date(d)) / 1000);
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!thread) return <div className="empty"><h3>Thread not found</h3></div>;

  return (
    <div>
      <Link to="/forums" style={{ color:'var(--accent2)', fontSize:'0.85rem' }}>← Back to Forums</Link>
      <div style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px', margin:'16px 0' }}>
        <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
          <span className={`category-badge cat-${thread.category}`}>{thread.category}</span>
        </div>
        <h1 style={{ fontSize:'1.4rem', marginBottom:'12px' }}>{thread.title}</h1>
        <div style={{ color:'var(--text2)', lineHeight:1.7 }}>{thread.content}</div>
        <div style={{ marginTop:'12px', fontSize:'0.8rem', color:'var(--text3)' }}>
          by <Link to={`/profile/${thread.user_id}`} style={{ color:'var(--accent2)' }}>{thread.username}</Link> · {timeAgo(thread.created_at)} · {thread.views} views
        </div>
      </div>

      <h3 style={{ marginBottom:'12px', color:'var(--text2)' }}>{thread.replies?.length || 0} Replies</h3>

      {thread.replies?.map((r, i) => (
        <div key={r.id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'6px', padding:'16px', marginBottom:'8px', display:'flex', gap:'12px' }}>
          <div style={{ width:'36px', height:'36px', background:'var(--accent2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'white', flexShrink:0 }}>
            {(r.username||'?')[0].toUpperCase()}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', gap:'8px', alignItems:'baseline', marginBottom:'6px' }}>
              <Link to={`/profile/${r.user_id}`} style={{ color:'var(--accent2)', fontWeight:600, fontSize:'0.85rem' }}>{r.username}</Link>
              <span style={{ color:'var(--text3)', fontSize:'0.75rem' }}>{timeAgo(r.created_at)}</span>
              <span style={{ color:'var(--text3)', fontSize:'0.75rem' }}>#{i+1}</span>
            </div>
            <div style={{ color:'var(--text)', lineHeight:1.6 }}>{r.content}</div>
          </div>
        </div>
      ))}

      {isAuthenticated ? (
        <form onSubmit={postReply} style={{ marginTop:'16px' }}>
          <textarea className="form-input" placeholder="Write a reply..." value={reply} onChange={e => setReply(e.target.value)} rows={4} style={{ width:'100%', marginBottom:'8px' }} />
          <button type="submit" className="btn-blue" style={{ padding:'9px 18px', borderRadius:'4px' }}>Post Reply</button>
        </form>
      ) : (
        <div style={{ textAlign:'center', padding:'16px', color:'var(--text3)' }}>
          <Link to="/login" style={{ color:'var(--accent2)' }}>Login</Link> to reply
        </div>
      )}
    </div>
  );
}
