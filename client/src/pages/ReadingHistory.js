import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chapterAPI } from '../api';
import '../App.css';

export default function ReadingHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await chapterAPI.getHistory();
      setHistory(res.data.data);
    } catch (err) {
      setError('Failed to load reading history');
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
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ padding: '2rem 0' }}>
        <h1>Reading History</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Continue reading where you left off
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {history.length === 0 ? (
        <div className="empty-state">
          <h2>No Reading History</h2>
          <p>You haven't read any manga yet.</p>
          <Link to="/search" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Start Reading
          </Link>
        </div>
      ) : (
        <div className="manga-grid">
          {history.map(item => (
            <Link
              key={item.manga_id}
              to={`/manga/${item.manga_id}`}
              className="manga-card"
            >
              {item.cover_url && (
                <img
                  src={item.cover_url}
                  alt={item.title}
                  className="manga-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/180x250?text=No+Cover';
                  }}
                />
              )}
              <div className="manga-info">
                <div className="manga-title">{item.title}</div>
                <div className="manga-meta">
                  Page {item.page_number || 0}
                </div>
                <div className="manga-meta" style={{ fontSize: '0.75rem' }}>
                  {new Date(item.last_read).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
