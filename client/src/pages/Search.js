import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { mangaAPI } from '../api';
import '../App.css';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const LIMIT = 12;

  useEffect(() => {
    if (query.trim()) {
      performSearch();
    }
  }, [page, query]);

  const performSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await mangaAPI.search(query, LIMIT, page * LIMIT);
      setResults(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      setError('Failed to search manga');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearchParams({ q: query });
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const goToPage = (newPage) => {
    if (newPage >= 0 && newPage < Math.ceil(total / LIMIT)) {
      setPage(newPage);
    }
  };

  const currentPage = page + 1;
  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="container">
      <div style={{ padding: '2rem 0' }}>
        <h1>Search Manga</h1>

        <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '1.5rem auto 0', padding: 0 }}>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search manga title..."
              value={query}
              onChange={handleInputChange}
              style={{ margin: 0, borderRadius: '4px 0 0 4px' }}
            />
            <button
              type="submit"
              className="btn-primary"
              style={{ borderRadius: '0 4px 4px 0', margin: 0, paddingLeft: '2rem', paddingRight: '2rem' }}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Searching...</p>
        </div>
      ) : (
        <>
          {results.length === 0 && query ? (
            <div className="empty-state">
              <p>No results found for "{query}"</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <p style={{ margin: '1.5rem 0', color: 'var(--text-secondary)' }}>
                Found {total} manga
              </p>

              <div className="manga-grid">
                {results.map(manga => (
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

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '2rem 0' }}>
                  <button
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 0}
                    className="btn-primary-outline"
                  >
                    Previous
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', fontWeight: '500' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages - 1}
                    className="btn-primary-outline"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : null}
        </>
      )}
    </div>
  );
}
