import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chapterAPI, bookmarkAPI } from '../api';
import { useAuth } from '../AuthContext';
import '../App.css';

export default function Reader() {
  const { mangaId, chapterId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);

  useEffect(() => {
    fetchChaptersAndPages();
  }, [mangaId, chapterId]);

  useEffect(() => {
    if (isAuthenticated) {
      saveReadingHistory();
    }
  }, [chapterId, currentPage]);

  useEffect(() => {
    if (isAuthenticated) {
      checkBookmark();
    }
  }, [chapterId, currentPage]);

  const fetchChaptersAndPages = async () => {
    try {
      setLoading(true);
      setError(null);

      const chaptersRes = await chapterAPI.getChapters(mangaId);
      const allChapters = chaptersRes.data.data;
      setChapters(allChapters);

      const currentIndex = allChapters.findIndex(ch => ch.id === chapterId);
      setCurrentChapterIndex(currentIndex);

      const pagesRes = await chapterAPI.getPages(chapterId);
      setPages(pagesRes.data.pages);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load chapter pages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveReadingHistory = async () => {
    try {
      await chapterAPI.saveHistory(mangaId, chapterId, currentPage);
    } catch (err) {
      console.error('Failed to save reading history:', err);
    }
  };

  const checkBookmark = async () => {
    try {
      const res = await bookmarkAPI.getByManga(mangaId);
      const isCurrentPageBookmarked = res.data.data.some(
        bm => bm.chapter_id === chapterId && bm.page_number === currentPage
      );
      setIsBookmarked(isCurrentPageBookmarked);
    } catch (err) {
      console.error('Failed to check bookmark:', err);
    }
  };

  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      alert('Please login to bookmark pages');
      return;
    }

    try {
      if (isBookmarked) {
        const res = await bookmarkAPI.getByManga(mangaId);
        const bookmark = res.data.data.find(
          bm => bm.chapter_id === chapterId && bm.page_number === currentPage
        );
        if (bookmark) {
          await bookmarkAPI.delete(bookmark.id);
          setIsBookmarked(false);
        }
      } else {
        await bookmarkAPI.create(mangaId, chapterId, currentPage);
        setIsBookmarked(true);
      }
    } catch (err) {
      console.error('Failed to toggle bookmark:', err);
    }
  };

  const goToNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1);
    } else if (currentChapterIndex > 0) {
      const nextChapter = chapters[currentChapterIndex - 1];
      navigate(`/reader/${mangaId}/${nextChapter.id}`);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (currentChapterIndex < chapters.length - 1) {
      const prevChapter = chapters[currentChapterIndex + 1];
      navigate(`/reader/${mangaId}/${prevChapter.id}`);
    }
  };

  const changeChapter = (newChapterId) => {
    navigate(`/reader/${mangaId}/${newChapterId}`);
  };

  if (loading) {
    return (
      <div className="reader-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (error || pages.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>Error</h2>
          <p>{error || 'No pages found for this chapter'}</p>
          <button
            onClick={() => navigate(`/manga/${mangaId}`)}
            className="btn-primary"
            style={{ marginTop: '1rem' }}
          >
            Back to Manga
          </button>
        </div>
      </div>
    );
  }

  const currentImageUrl = pages[currentPage - 1]?.url;

  return (
    <div className="reader-container">
      <div style={{ maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
        {currentImageUrl && (
          <img
            src={currentImageUrl}
            alt={`Page ${currentPage}`}
            className="reader-page"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x700?text=Failed+to+load';
            }}
          />
        )}
      </div>

      <div className="reader-controls">
        <div className="page-info">
          Page {currentPage} of {pages.length}
        </div>

        <select
          value={chapterId}
          onChange={(e) => changeChapter(e.target.value)}
          style={{ padding: '0.5rem' }}
        >
          {chapters.map(ch => (
            <option key={ch.id} value={ch.id}>
              {ch.title || `Chapter ${ch.chapterNumber}`}
            </option>
          ))}
        </select>

        <div className="navigation-buttons">
          <button
            onClick={goToPreviousPage}
            disabled={currentPage === 1 && currentChapterIndex === chapters.length - 1}
            className="btn-primary-outline"
            style={{ cursor: currentPage === 1 && currentChapterIndex === chapters.length - 1 ? 'not-allowed' : 'pointer' }}
          >
            ← Previous
          </button>

          <button
            onClick={toggleBookmark}
            className={isBookmarked ? 'btn-secondary' : 'btn-primary-outline'}
            title="Bookmark this page"
          >
            {isBookmarked ? '📌 Bookmarked' : '📌 Bookmark'}
          </button>

          <button
            onClick={goToNextPage}
            disabled={currentPage === pages.length && currentChapterIndex === 0}
            className="btn-primary-outline"
            style={{ cursor: currentPage === pages.length && currentChapterIndex === 0 ? 'not-allowed' : 'pointer' }}
          >
            Next →
          </button>
        </div>

        <button
          onClick={() => navigate(`/manga/${mangaId}`)}
          className="btn-primary-outline"
        >
          Back
        </button>
      </div>
    </div>
  );
}
