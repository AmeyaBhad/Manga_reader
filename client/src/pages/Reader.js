import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, ChevronLeft } from 'lucide-react';
import { chapterAPI, bookmarkAPI } from '../api';
import { useAuth } from '../AuthContext';

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
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    setLoading(true); setError(null);
    Promise.all([chapterAPI.getChapters(mangaId), chapterAPI.getPages(chapterId)])
      .then(([chs, pg]) => {
        const all = chs.data.data;
        setChapters(all);
        setCurrentIdx(all.findIndex(c => c.id === chapterId));
        setPages(pg.data.pages);
        setCurrentPage(1);
      }).catch(() => setError('Failed to load chapter'))
      .finally(() => setLoading(false));
  }, [mangaId, chapterId]);

  useEffect(() => {
    if (isAuthenticated && pages.length) chapterAPI.saveHistory(mangaId, chapterId, currentPage).catch(() => {});
  }, [currentPage, chapterId]);

  useEffect(() => {
    if (!isAuthenticated) return;
    bookmarkAPI.getByManga(mangaId).then(r => {
      setIsBookmarked(r.data.data.some(b => b.chapter_id === chapterId && b.page_number === currentPage));
    }).catch(() => {});
  }, [chapterId, currentPage, isAuthenticated]);

  const goNext = () => {
    if (currentPage < pages.length) setCurrentPage(p => p+1);
    else if (currentIdx > 0) navigate(`/reader/${mangaId}/${chapters[currentIdx-1].id}`);
  };
  const goPrev = () => {
    if (currentPage > 1) setCurrentPage(p => p-1);
    else if (currentIdx < chapters.length-1) navigate(`/reader/${mangaId}/${chapters[currentIdx+1].id}`);
  };

  const toggleBookmark = async () => {
    if (!isAuthenticated) return alert('Login required');
    try {
      if (isBookmarked) {
        const r = await bookmarkAPI.getByManga(mangaId);
        const bm = r.data.data.find(b => b.chapter_id === chapterId && b.page_number === currentPage);
        if (bm) { await bookmarkAPI.delete(bm.id); setIsBookmarked(false); }
      } else { await bookmarkAPI.create(mangaId, chapterId, currentPage); setIsBookmarked(true); }
    } catch {}
  };

  if (loading) return <div className="reader-wrapper"><div className="loading"><div className="spinner" /><p>Loading...</p></div></div>;
  if (error || !pages.length) return (
    <div className="reader-wrapper">
      <div className="loading" style={{ color:'var(--red)' }}>
        {error || 'No pages found'}
        <Link to={`/manga/${mangaId}`} style={{ color:'var(--accent2)', marginTop:'12px', display:'flex', alignItems:'center', gap:'4px', justifyContent:'center' }}>
          <ChevronLeft size={16} /> Back to Manga
        </Link>
      </div>
    </div>
  );

  return (
    <div className="reader-wrapper">
      <div className="reader-topbar">
        <Link to={`/manga/${mangaId}`} className="nav-btn" style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.85rem' }}>
          <ChevronLeft size={15} /> Back
        </Link>
        <select className="chapter-select" value={chapterId} onChange={e => navigate(`/reader/${mangaId}/${e.target.value}`)}>
          {chapters.map(c => <option key={c.id} value={c.id}>{c.title || `Chapter ${c.chapterNumber}`}</option>)}
        </select>
        <span className="page-counter">{currentPage} / {pages.length}</span>
        <button onClick={toggleBookmark} className="nav-btn" style={{ display:'flex', alignItems:'center', gap:'6px', color: isBookmarked ? 'var(--yellow)' : undefined }}>
          {isBookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          {isBookmarked ? 'Saved' : 'Bookmark'}
        </button>
      </div>

      <div className="reader-image-container" onClick={e => { if (e.clientX > window.innerWidth/2) goNext(); else goPrev(); }}>
        <img src={pages[currentPage-1]?.url} alt={`Page ${currentPage}`} className="reader-image"
          style={{ cursor:'pointer' }}
          onError={e => e.target.src='https://placehold.co/800x1200/0f0f0f/333?text=Failed+to+load'} />
      </div>

      <div className="reader-bottombar">
        <button onClick={goPrev} disabled={currentPage===1 && currentIdx===chapters.length-1} className="nav-btn" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <ArrowLeft size={15} /> Previous
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          {pages.slice(Math.max(0, currentPage-5), Math.min(pages.length, currentPage+4)).map((_, i) => {
            const pageNum = Math.max(0, currentPage-5) + i + 1;
            return (
              <button key={pageNum} onClick={() => setCurrentPage(pageNum)}
                style={{ width:'8px', height:'8px', borderRadius:'50%', border:'none', background: pageNum===currentPage ? 'var(--accent2)' : 'var(--bg4)', cursor:'pointer', padding:0 }} />
            );
          })}
        </div>
        <button onClick={goNext} disabled={currentPage===pages.length && currentIdx===0} className="nav-btn" style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          Next <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}
