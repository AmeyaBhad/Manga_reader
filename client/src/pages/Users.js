import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users as UsersIcon, Calendar } from 'lucide-react';
import { usersAPI } from '../api';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { usersAPI.getAll().then(r => setUsers(r.data.data)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title" style={{ display:'flex', alignItems:'center', gap:'8px' }}><UsersIcon size={22} /> Users</h1>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'12px' }}>
        {users.map(u => (
          <Link to={`/profile/${u.id}`} key={u.id}
            style={{ background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'16px', textDecoration:'none', display:'flex', gap:'12px', alignItems:'center', transition:'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor='var(--accent2)'}
            onMouseLeave={e => e.currentTarget.style.borderColor='var(--border)'}>
            <div style={{ width:'44px', height:'44px', background:'var(--accent2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', fontWeight:700, color:'white', flexShrink:0 }}>
              {u.username[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight:600, color:'var(--text)' }}>{u.username}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text3)', display:'flex', alignItems:'center', gap:'4px', marginTop:'3px' }}>
                <Calendar size={11} /> {new Date(u.created_at).toLocaleDateString()}
              </div>
            </div>
          </Link>
        ))}
      </div>
      {users.length === 0 && <div className="empty"><h3>No users yet</h3></div>}
    </div>
  );
}
