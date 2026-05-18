import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mangaAPI, chapterAPI, favoriteAPI } from '../api';
import { useAuth } from '../AuthContext';
import '../App.css';

export default function MangaDetail() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [manga, setManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMangaAndChapters();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && manga) {
      checkFavorite();
    }
  }, [manga, isAuthenticated]);

  const fetchMangaAndChapters = async () => {
    try {
      setLoading(true);
      setError(null);
      const mangaRes = await mangaAPI.getDetails(id);
      setManga(mangaRes.data);

      const chaptersRes = await chapterAPI.getChapters(id);
      setChapters(chaptersRes.data.data);
    } catch (err) {
      setError('Failed to load manga details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const res = await favoriteAPI.isFavorite(id);
      setIsFavorite(res.data.isFavorite);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('Please login to add favorites');
      return;
    }

    try {
      if (isFavorite) {
        await favoriteAPI.remove(id);
        setIsFavorite(false);
      } else {
        await favoriteAPI.add(id);
        setIsFavorite(true);
      }
    } catch (err) {
      alert('Failed to update favorite');
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

  if (!manga) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Manga Not Found</h2>
          <p>{error || 'Could not load manga details'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="manga-detail">
        <div>
          {manga.cover && (
            <img
              src={manga.cover}
              alt={manga.title}
              className="manga-cover-large"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/250x350?text=No+Cover';
              }}
            />
          )}
        </div>

        <div>
          <div className="manga-header">
            <h1 className="manga-title-large">{manga.title}</h1>

            <div className="manga-actions">
              <button
                onClick={toggleFavorite}
                className={isFavorite ? 'btn-secondary' : 'btn-primary-outline'}
              >
                {isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
              </button>
              {chapters.length > 0 && (
                <Link
                  to={`/reader/${id}/${chapters[0].id}`}
                  className="btn btn-primary"
                >
                  Start Reading
                </Link>
              )}
            </div>

            {manga.description && (
              <>
                <h3 style={{ marginTop: '1.5rem', marginBottom: '0.5rem' }}>Description</h3>
                <p className="manga-description">{manga.description}</p>
              </>
            )}

            {manga.authors && manga.authors.length > 0 && (
              <div>
                <strong>Authors:</strong> {manga.authors.join(', ')}
              </div>
            )}

            {manga.artists && manga.artists.length > 0 && (
              <div>
                <strong>Artists:</strong> {manga.artists.join(', ')}
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <span className="manga-status">
                {manga.status?.toUpperCase() || 'UNKNOWN'}
              </span>
              {manga.year && (
                <span className="manga-status" style={{ marginLeft: '0.5rem' }}>
                  {manga.year}
                </span>
              )}
            </div>

            {manga.tags && manga.tags.length > 0 && (
              <>
                <h4 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>Tags</h4>
                <div className="manga-tags">
                  {manga.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Chapters ({chapters.length})</h2>

        {chapters.length === 0 ? (
          <div className="empty-state">
            <p>No chapters available yet</p>
          </div>
        ) : (
          <ul className="chapters-list">
            {chapters.map(chapter => (
              <li key={chapter.id} className="chapter-item">
                <Link to={`/reader/${id}/${chapter.id}`}>
                  {chapter.title || `Chapter ${chapter.chapterNumber}`}
                </Link>
                <span className="chapter-date">
                  {new Date(chapter.publishedAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
