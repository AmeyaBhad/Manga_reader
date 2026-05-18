import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { mangaAPI } from '../api';

const STATUSES = ['', 'ongoing', 'completed', 'hiatus', 'cancelled'];
const RATINGS = ['', 'safe', 'suggestive', 'erotica'];
const YEARS = ['', ...Array.from({length: 35}, (_, i) => String(2024 - i))];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [status, setStatus] = useState('');
  const [rating, setRating] = useState('');
  const [year, setYear] = useState('');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const LIMIT = 18;

  useEffect(() => {
    if (query.trim()) search();
  }, [page]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await mangaAPI.search(query, LIMIT, page * LIMIT);
      setResults(res.data.data);
      setTotal(res.data.total);
    } catch { } finally { setLoading(false); }
  };

  const handleSubmit = (e) => { e.preventDefault(); setPage(0); setSearchParams({ q: query }); search(); };

  const statusClass = (s) => {
    const m = { ongoing: 'status-ongoing', completed: 'status-completed', hiatus: 'status-hiatus', cancelled: 'status-cancelled' };
    return m[s] || '';
  };

  return (
    <div>
      <h1 className="page-title">🔍 Advanced Search</h1>
      <form onSubmit={handleSubmit}>
        <div className="search-filters">
          <div className="filter-group" style={{ flex: 1, minWidth: '200px' }}>
            <label className="filter-label">Title</label>
            <input className="filter-input" placeholder="Search manga title..." value={query}
              onChange={e => setQuery(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div className="filter-group">
            <label className="filter-label">Status</label>
            <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
              {STATUSES.map(s => <option key={s} value={s}>{s || 'Any'}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Rating</label>
            <select className="filter-select" value={rating} onChange={e => setRating(e.target.value)}>
              {RATINGS.map(r => <option key={r} value={r}>{r || 'Any'}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">Year</label>
            <select className="filter-select" value={year} onChange={e => setYear(e.target.value)}>
              {YEARS.map(y => <option key={y} value={y}>{y || 'Any'}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-blue" style={{ padding: '8px 20px', borderRadius: '4px' }}>Search</button>
        </div>
      </form>

      {loading ? <div className="loading"><div className="spinner" /></div> : (
        <>
          {total > 0 && <p style={{ color: 'var(--text2)', marginBottom: '16px', fontSize: '0.9rem' }}>{total} results found</p>}
          <div className="manga-grid">
            {results.map(m => (
              <Link to={`/manga/${m.id}`} key={m.id} className="manga-card">
                <img src={m.cover} alt={m.title} className="manga-cover"
                  onError={e => e.target.src='https://placehold.co/150x225/1a1a1a/666?text=No+Cover'} />
                <div className="manga-info">
                  <div className="manga-title">{m.title}</div>
                  <div className="manga-meta">{m.year || ''}</div>
                  {m.status && <span className={`manga-status-badge ${statusClass(m.status)}`}>{m.status}</span>}
                </div>
              </Link>
            ))}
          </div>
          {results.length === 0 && query && (
            <div className="empty"><h3>No results for "{query}"</h3><p>Try a different search term</p></div>
          )}
          {total > LIMIT && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px', alignItems: 'center' }}>
              <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0} className="nav-btn">← Previous</button>
              <span style={{ color: 'var(--text2)', fontSize: '0.9rem' }}>Page {page+1} of {Math.ceil(total/LIMIT)}</span>
              <button onClick={() => setPage(p => p+1)} disabled={(page+1)*LIMIT >= total} className="nav-btn">Next →</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
