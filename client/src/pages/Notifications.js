import React, { useState, useEffect } from 'react';
import { CheckCheck } from 'lucide-react';
import { notificationsAPI } from '../api';
import { useAuth } from '../AuthContext';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationsAPI.getAll().then(r => setNotifs(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const markAllRead = async () => {
    await notificationsAPI.readAll();
    setNotifs(notifs.map(n => ({ ...n, is_read: 1 })));
  };

  const timeAgo = (d) => {
    const diff = Math.floor((new Date() - new Date(d)) / 1000);
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  if (!isAuthenticated) return <div className="empty"><h3>Login to view notifications</h3><Link to="/login" style={{ color:'var(--accent2)' }}>Login</Link></div>;
  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const unread = notifs.filter(n => !n.is_read).length;

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <h1 className="page-title" style={{ margin:0 }}>Notifications {unread > 0 && <span style={{ background:'var(--accent)', color:'white', fontSize:'0.75rem', padding:'2px 8px', borderRadius:'10px', marginLeft:'8px', verticalAlign:'middle' }}>{unread}</span>}</h1>
        {unread > 0 && (
          <button className="btn-ghost icon-btn" style={{ padding:'6px 14px', borderRadius:'4px', fontSize:'0.85rem' }} onClick={markAllRead}>
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>
      {notifs.length === 0 ? (
        <div className="empty"><h3>No notifications</h3><p>You're all caught up!</p></div>
      ) : notifs.map(n => (
        <div key={n.id} className={`notif-item ${!n.is_read ? 'unread' : ''}`}>
          <div className={`notif-dot ${n.is_read ? 'read' : ''}`} />
          <div style={{ flex:1 }}>
            <div className="notif-text">{n.message}</div>
            <div className="notif-time">{timeAgo(n.created_at)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
