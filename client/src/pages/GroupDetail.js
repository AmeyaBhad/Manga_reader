import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { groupsAPI } from '../api';
import { useAuth } from '../AuthContext';

export default function GroupDetail() {
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => { groupsAPI.getById(id).then(r => setGroup(r.data)).catch(console.error).finally(() => setLoading(false)); }, [id]);

  const isMember = group?.members?.some(m => m.user_id === user?.id);

  const joinLeave = async () => {
    if (!isAuthenticated) return alert('Login required');
    try {
      if (isMember) await groupsAPI.leave(id); else await groupsAPI.join(id);
      const r = await groupsAPI.getById(id); setGroup(r.data);
    } catch {}
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!group) return <div className="empty"><h3>Group not found</h3></div>;

  return (
    <div>
      <Link to="/groups" style={{ color:'var(--accent2)', fontSize:'0.85rem' }}>← Back to Groups</Link>
      <div className="profile-header" style={{ marginTop:'16px' }}>
        <div className="group-avatar" style={{ width:'72px', height:'72px', fontSize:'2rem' }}>{group.name[0].toUpperCase()}</div>
        <div style={{ flex:1 }}>
          <h1 style={{ fontSize:'1.6rem', marginBottom:'6px' }}>{group.name}</h1>
          {group.description && <p style={{ color:'var(--text2)', marginBottom:'8px' }}>{group.description}</p>}
          <div style={{ color:'var(--text3)', fontSize:'0.85rem' }}>Leader: <Link to={`/profile/${group.leader_id}`} style={{ color:'var(--accent2)' }}>{group.leader_name}</Link></div>
        </div>
        <div>
          {isAuthenticated && (
            <button onClick={joinLeave} className={isMember ? 'btn-ghost' : 'btn-blue'} style={{ padding:'8px 18px', borderRadius:'4px' }}>
              {isMember ? 'Leave Group' : 'Join Group'}
            </button>
          )}
        </div>
      </div>

      <h3 style={{ margin:'20px 0 12px' }}>👥 Members ({group.members?.length || 0})</h3>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
        {group.members?.map(m => (
          <Link to={`/profile/${m.user_id}`} key={m.user_id} style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'4px', padding:'8px 14px', fontSize:'0.85rem', color:'var(--text)', textDecoration:'none', display:'flex', alignItems:'center', gap:'6px' }}>
            <span style={{ width:'28px', height:'28px', background:'var(--accent2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, color:'white' }}>{(m.username||'?')[0].toUpperCase()}</span>
            {m.username}
            {m.role === 'leader' && <span style={{ color:'var(--yellow)', fontSize:'0.75rem' }}>👑</span>}
          </Link>
        ))}
      </div>
    </div>
  );
}
