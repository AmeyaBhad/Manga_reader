import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { listsAPI } from '../api';

export default function ListDetail() {
  const { id } = useParams();
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { listsAPI.getById(id).then(r => setList(r.data)).catch(console.error).finally(() => setLoading(false)); }, [id]);

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!list) return <div className="empty"><h3>List not found</h3></div>;

  return (
    <div>
      <Link to="/lists" style={{ color:'var(--accent2)', fontSize:'0.85rem' }}>← Back to Lists</Link>
      <div style={{ margin:'16px 0 24px' }}>
        <h1 style={{ fontSize:'1.6rem', marginBottom:'6px' }}>{list.name}</h1>
        {list.description && <p style={{ color:'var(--text2)' }}>{list.description}</p>}
        <p style={{ color:'var(--text3)', fontSize:'0.85rem' }}>by {list.username} · {list.items?.length || 0} manga</p>
      </div>
      {list.items?.length === 0 ? (
        <div className="empty"><h3>Empty list</h3></div>
      ) : (
        <div className="manga-grid">
          {list.items.map(item => (
            <Link to={`/manga/${item.manga_id}`} key={item.manga_id} className="manga-card">
              {item.cover_url && <img src={item.cover_url} alt={item.title} className="manga-cover" onError={e => e.target.src='https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />}
              <div className="manga-info">
                <div className="manga-title">{item.title}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
