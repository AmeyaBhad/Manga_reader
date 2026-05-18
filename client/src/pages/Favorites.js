import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteAPI } from '../api';
import '../App.css';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await favoriteAPI.getAll();
      setFavorites(res.data.data);
    } catch (err) {
      setError('Failed to load favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (mangaId) => {
    try {
      await favoriteAPI.remove(mangaId);
      setFavorites(favorites.filter(m => m.id !== mangaId));
    } catch (err) {
      alert('Failed to remove from favorites');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ padding: '2rem 0' }}>
        <h1>Favorite Manga</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Your favorite manga collection
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {favorites.length === 0 ? (
        <div className="empty-state">
          <h2>No Favorites Yet</h2>
          <p>Add manga to your favorites to see them here.</p>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Explore Manga
          </Link>
        </div>
      ) : (
        <div className="manga-grid">
          {favorites.map(manga => (
            <div key={manga.id} className="manga-card" style={{ position: 'relative' }}>
              <Link to={`/manga/${manga.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                {manga.cover_url && (
                  <img
                    src={manga.cover_url}
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

              <button
                onClick={() => removeFavorite(manga.id)}
                className="btn-secondary"
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  padding: '0.4rem 0.6rem',
                  fontSize: '0.8rem'
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
