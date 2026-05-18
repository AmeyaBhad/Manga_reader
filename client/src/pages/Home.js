import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mangaAPI } from '../api';
import '../App.css';

export default function Home() {
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await mangaAPI.getTrending(12);
      setTrending(res.data.data);
    } catch (err) {
      setError('Failed to load trending manga');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading trending manga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ padding: '2rem 0' }}>
        <h1>Welcome to Manga Reader</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          Discover and read your favorite manga
        </p>
      </div>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Trending Now</h2>

      {error && <div className="error-message">{error}</div>}

      {trending.length === 0 ? (
        <div className="empty-state">
          <p>No manga found</p>
        </div>
      ) : (
        <div className="manga-grid">
          {trending.map(manga => (
            <Link
              key={manga.id}
              to={`/manga/${manga.id}`}
              className="manga-card"
            >
              {manga.cover && (
                <img
                  src={manga.cover}
                  alt={manga.title}
                  className="manga-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/180x250?text=No+Cover';
                  }}
                />
              )}
              <div className="manga-info">
                <div className="manga-title">{manga.title}</div>
                <div className="manga-meta">
                  Status: <strong>{manga.status || 'Unknown'}</strong>
                </div>
                {manga.year && (
                  <div className="manga-meta">Year: {manga.year}</div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
