import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { List, Plus, Trash2, ExternalLink, Globe, Lock } from 'lucide-react';
import { listsAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function Lists() {
  const [lists, setLists] = useState([]);
  const [publicLists, setPublicLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('mine');
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) listsAPI.getAll().then(r => setLists(r.data.data)).catch(console.error);
    listsAPI.getPublic().then(r => setPublicLists(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const create = async (e) => {
    e.preventDefault();
    try { await listsAPI.create(name, desc); setName(''); setDesc(''); setShowNew(false); const r = await listsAPI.getAll(); setLists(r.data.data); } catch {}
  };

  const deleteList = async (id) => {
    if (!window.confirm('Delete this list?')) return;
    try { await listsAPI.delete(id); setLists(lists.filter(l => l.id !== id)); } catch {}
  };

  const shown = tab === 'mine' ? lists : publicLists;
  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <h1 className="page-title" style={{ margin:0, display:'flex', alignItems:'center', gap:'8px' }}><List size={22} /> Lists</h1>
        {isAuthenticated && (
          <button className="btn-blue" style={{ padding:'8px 14px', borderRadius:'4px', display:'flex', alignItems:'center', gap:'6px' }} onClick={() => setShowNew(!showNew)}>
            <Plus size={16} /> New List
          </button>
        )}
      </div>

      {showNew && (
        <form onSubmit={create} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px', marginBottom:'20px' }}>
          <div style={{ marginBottom:'10px' }}><input className="form-input" placeholder="List name..." value={name} onChange={e => setName(e.target.value)} required /></div>
          <div style={{ marginBottom:'10px' }}><input className="form-input" placeholder="Description (optional)..." value={desc} onChange={e => setDesc(e.target.value)} /></div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button type="submit" className="btn-blue" style={{ padding:'8px 16px', borderRadius:'4px' }}>Create</button>
            <button type="button" className="btn-ghost" style={{ padding:'8px 16px', borderRadius:'4px' }} onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </form>
      )}

      {isAuthenticated && (
        <div className="status-tabs" style={{ marginBottom:'16px' }}>
          <button className={`status-tab ${tab==='mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>My Lists</button>
          <button className={`status-tab ${tab==='public' ? 'active' : ''}`} onClick={() => setTab('public')}>Public Lists</button>
        </div>
      )}

      {shown.length === 0 ? <div className="empty"><h3>No lists yet</h3></div> :
        shown.map(l => (
          <div key={l.id} className="list-card">
            <div>
              <div className="list-name" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                {l.is_public ? <Globe size={14} color="var(--text3)" /> : <Lock size={14} color="var(--text3)" />}
                <Link to={`/lists/${l.id}`} style={{ color:'var(--text)', textDecoration:'none' }}>{l.name}</Link>
              </div>
              {l.description && <div className="list-meta">{l.description}</div>}
              <div className="list-meta">{l.item_count || 0} manga {l.username ? `· by ${l.username}` : ''}</div>
            </div>
            <div style={{ display:'flex', gap:'8px' }}>
              <Link to={`/lists/${l.id}`} className="btn-ghost" style={{ padding:'6px 12px', borderRadius:'4px', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'4px' }}>
                <ExternalLink size={13} /> View
              </Link>
              {tab === 'mine' && (
                <button onClick={() => deleteList(l.id)} className="btn-ghost" style={{ padding:'6px 12px', borderRadius:'4px', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'4px', color:'var(--red)' }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>
        ))}
    </div>
  );
}
