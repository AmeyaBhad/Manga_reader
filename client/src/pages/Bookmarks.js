import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookmarkAPI } from '../api';
import '../App.css';

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookmarkAPI.getAll();
      setBookmarks(res.data.data);
    } catch (err) {
      setError('Failed to load bookmarks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (id) => {
    try {
      await bookmarkAPI.delete(id);
      setBookmarks(bookmarks.filter(b => b.id !== id));
    } catch (err) {
      alert('Failed to remove bookmark');
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
        <h1>Bookmarked Pages</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Pages you've bookmarked for later
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {bookmarks.length === 0 ? (
        <div className="empty-state">
          <h2>No Bookmarks</h2>
          <p>Bookmark pages while reading to access them later.</p>
          <Link to="/history" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            View Reading History
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {bookmarks.map(bookmark => (
            <div
              key={bookmark.id}
              style={{
                background: 'var(--bg-primary)',
                padding: '1rem',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {bookmark.cover_url && (
                  <img
                    src={bookmark.cover_url}
                    alt={bookmark.title}
                    style={{ width: '80px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x120?text=No+Cover';
                    }}
                  />
                )}

                <div style={{ flex: 1 }}>
                  <Link
                    to={`/manga/${bookmark.manga_id}`}
                    style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '600' }}
                  >
                    {bookmark.title}
                  </Link>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {bookmark.chapter_title}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Page {bookmark.page_number || 0}
                  </div>

                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="btn-secondary btn-small"
                    style={{ marginTop: '0.5rem' }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <Link
                to={`/reader/${bookmark.manga_id}/${bookmark.chapter_id}`}
                className="btn btn-primary"
                style={{ textAlign: 'center', marginTop: '0.5rem' }}
              >
                Continue Reading
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
