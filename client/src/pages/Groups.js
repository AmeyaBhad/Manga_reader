import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, Crown } from 'lucide-react';
import { groupsAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => { groupsAPI.getAll().then(r => setGroups(r.data.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  const create = async (e) => {
    e.preventDefault();
    try { await groupsAPI.create(name, desc); setName(''); setDesc(''); setShowNew(false); const r = await groupsAPI.getAll(); setGroups(r.data.data); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <h1 className="page-title" style={{ margin:0 }}>Groups</h1>
        {isAuthenticated && (
          <button className="btn-blue" style={{ padding:'8px 14px', borderRadius:'4px', display:'flex', alignItems:'center', gap:'6px' }} onClick={() => setShowNew(!showNew)}>
            <Plus size={16} /> Create Group
          </button>
        )}
      </div>

      {showNew && (
        <form onSubmit={create} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'20px', marginBottom:'20px' }}>
          <div style={{ marginBottom:'10px' }}><input className="form-input" placeholder="Group name..." value={name} onChange={e => setName(e.target.value)} required /></div>
          <div style={{ marginBottom:'10px' }}><textarea className="form-input" placeholder="Description..." value={desc} onChange={e => setDesc(e.target.value)} rows={3} /></div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button type="submit" className="btn-blue" style={{ padding:'8px 16px', borderRadius:'4px' }}>Create</button>
            <button type="button" className="btn-ghost" style={{ padding:'8px 16px', borderRadius:'4px' }} onClick={() => setShowNew(false)}>Cancel</button>
          </div>
        </form>
      )}

      {groups.length === 0 ? <div className="empty"><h3>No groups yet</h3><p>Create the first group!</p></div> :
        groups.map(g => (
          <Link to={`/groups/${g.id}`} key={g.id} style={{ textDecoration:'none' }}>
            <div className="group-card">
              <div className="group-avatar" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Users size={20} />
              </div>
              <div className="group-info">
                <div className="group-name">{g.name}</div>
                {g.description && <div className="group-desc">{g.description}</div>}
                <div className="group-meta" style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><Crown size={12} /> {g.leader_name}</span>
                  <span style={{ display:'flex', alignItems:'center', gap:'4px' }}><Users size={12} /> {g.member_count}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
    </div>
  );
}
