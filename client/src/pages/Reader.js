import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, ChevronLeft,
  Settings, X, ArrowUp, ChevronRight, Maximize, Minimize
} from 'lucide-react';
import { chapterAPI, bookmarkAPI, mangaAPI } from '../api';
import { useAuth } from '../AuthContext';

// ── Preferences helpers ────────────────────────────────────────
const DEFAULT_PREFS = {
  direction: 'rtl',
  style: 'single',
  fit: 'width',
  stickyNav: true,
  gapBetween: true,
  darkBg: true,
};

const loadPrefs = () => {
  try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem('readerPrefs') || '{}') }; }
  catch { return DEFAULT_PREFS; }
};
const savePrefs = p => localStorage.setItem('readerPrefs', JSON.stringify(p));

const detectStyle = (manga) => {
  if (!manga) return {};
  const tags = (manga.tags || []).map(t => t.toLowerCase());
  const isLongStrip = tags.some(t => ['long strip', 'web comic', 'webtoon'].includes(t));
  const isRTL = !isLongStrip && !tags.some(t => ['manhwa', 'manhua'].includes(t));
  return { direction: isRTL ? 'rtl' : 'ltr', style: isLongStrip ? 'longstrip' : 'single' };
};

// ── Toggle ─────────────────────────────────────────────────────
function Toggle({ label, checked, onChange }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{label}</span>
      <div onClick={onChange} style={{ width: 36, height: 20, borderRadius: 10, background: checked ? 'var(--accent2)' : 'var(--bg4)', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
        <div style={{ width: 16, height: 16, background: '#fff', borderRadius: '50%', position: 'absolute', top: 2, left: checked ? 18 : 2, transition: 'left 0.2s' }} />
      </div>
    </div>
  );
}

// ── Radio Group ────────────────────────────────────────────────
function RadioGroup({ label, options, value, onChange }) {
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 8 }}>{label}</div>
      {options.map(o => (
        <div key={o.value} onClick={() => onChange(o.value)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', cursor: 'pointer' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${value === o.value ? 'var(--accent2)' : 'var(--text3)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {value === o.value && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent2)' }} />}
          </div>
          <span style={{ fontSize: '0.85rem', color: value === o.value ? 'var(--text)' : 'var(--text2)' }}>{o.label}</span>
        </div>
      ))}
    </div>
  );
}

// ── Reader ─────────────────────────────────────────────────────
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
  const [showPrefs, setShowPrefs] = useState(false);
  const [prefs, setPrefs] = useState(loadPrefs);
  const [mangaInfo, setMangaInfo] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerRef = useRef(null);
  const topRef = useRef(null);

  // Load data
  useEffect(() => {
    setLoading(true); setError(null);
    Promise.all([
      chapterAPI.getChapters(mangaId),
      chapterAPI.getPages(chapterId),
      mangaAPI.getDetails(mangaId),
    ]).then(([chs, pg, mg]) => {
      const all = chs.data.data;
      setChapters(all);
      setCurrentIdx(all.findIndex(c => c.id === chapterId));
      setPages(pg.data.pages);
      setCurrentPage(1);
      setMangaInfo(mg.data);
      // Auto-detect only if no saved prefs
      const saved = localStorage.getItem('readerPrefs');
      if (!saved) {
        const detected = { ...DEFAULT_PREFS, ...detectStyle(mg.data) };
        setPrefs(detected); savePrefs(detected);
      }
    }).catch(() => setError('Failed to load chapter')).finally(() => setLoading(false));
  }, [mangaId, chapterId]);

  // Save history
  useEffect(() => {
    if (isAuthenticated && pages.length) chapterAPI.saveHistory(mangaId, chapterId, currentPage).catch(() => {});
  }, [currentPage, chapterId, isAuthenticated]);

  // Bookmark check
  useEffect(() => {
    if (!isAuthenticated) return;
    bookmarkAPI.getByManga(mangaId).then(r =>
      setIsBookmarked(r.data.data.some(b => b.chapter_id === chapterId && b.page_number === currentPage))
    ).catch(() => {});
  }, [chapterId, currentPage, isAuthenticated]);

  // Fullscreen API
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  const updatePref = (k, v) => { const n = { ...prefs, [k]: v }; setPrefs(n); savePrefs(n); };

  const isDouble = prefs.style === 'double';
  const isLongStrip = prefs.style === 'longstrip';

  // Navigation — double moves by 2 (cover alone)
  const goNext = useCallback(() => {
    if (isLongStrip) return;
    const step = isDouble ? (currentPage === 1 ? 1 : 2) : 1;
    if (currentPage + step - 1 < pages.length) setCurrentPage(p => p + step);
    else if (currentIdx > 0) navigate(`/reader/${mangaId}/${chapters[currentIdx - 1].id}`);
  }, [isLongStrip, isDouble, currentPage, pages.length, currentIdx, chapters, mangaId, navigate]);

  const goPrev = useCallback(() => {
    if (isLongStrip) return;
    const step = isDouble ? (currentPage <= 2 ? 1 : 2) : 1;
    if (currentPage > 1) setCurrentPage(p => Math.max(1, p - step));
    else if (currentIdx < chapters.length - 1) navigate(`/reader/${mangaId}/${chapters[currentIdx + 1].id}`);
  }, [isLongStrip, isDouble, currentPage, currentIdx, chapters, mangaId, navigate]);

  const navLeft = prefs.direction === 'rtl' ? goNext : goPrev;
  const navRight = prefs.direction === 'rtl' ? goPrev : goNext;

  const handlePageClick = (e) => {
    if (isLongStrip) return;
    const right = e.clientX > window.innerWidth / 2;
    right ? navRight() : navLeft();
  };

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight') navRight();
      if (e.key === 'ArrowLeft') navLeft();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
      if (e.key === 'Escape') setShowPrefs(false);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [navLeft, navRight]);

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

  // Which pages to render
  const getPages = () => {
    if (isLongStrip) return pages;
    if (isDouble) {
      if (currentPage === 1) return [pages[0]].filter(Boolean);
      const a = pages[currentPage - 1], b = pages[currentPage];
      return (prefs.direction === 'rtl' ? [b, a] : [a, b]).filter(Boolean);
    }
    return [pages[currentPage - 1]].filter(Boolean);
  };

  const bgColor = prefs.darkBg ? '#0a0a0a' : '#f4f4f6';
  const barBg = prefs.darkBg ? 'rgba(10,10,10,0.96)' : 'rgba(255,255,255,0.96)';
  const barBorder = prefs.darkBg ? '#222' : '#e0e0e5';
  const textColor = prefs.darkBg ? '#e0e0e0' : '#1a1a1a';
  const textDim = prefs.darkBg ? '#888' : '#666';

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
      <div className="spinner" /><p style={{ color: 'var(--text2)' }}>Loading chapter...</p>
    </div>
  );

  if (error || !pages.length) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: 12 }}>
      <p style={{ color: 'var(--red)' }}>{error || 'No pages found'}</p>
      <Link to={`/manga/${mangaId}`} style={{ color: 'var(--accent2)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <ChevronLeft size={16} /> Back to Manga
      </Link>
    </div>
  );

  const visiblePages = getPages();

  return (
    <div
      ref={readerRef}
      style={{ background: bgColor, borderRadius: 8, overflow: 'hidden', position: 'relative', minHeight: '80vh' }}
    >
      {/* ── Topbar ── */}
      <div ref={topRef} style={{
        position: prefs.stickyNav ? 'sticky' : 'relative',
        top: 0, zIndex: 100,
        background: barBg,
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${barBorder}`,
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
        flexWrap: 'nowrap',
        transition: 'background 0.2s, border-color 0.2s',
      }}>
        <Link to={`/manga/${mangaId}`} className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', flexShrink: 0, color: textColor }}>
          <ChevronLeft size={14} /> Back
        </Link>

        {mangaInfo && (
          <span style={{ color: textDim, fontSize: '0.82rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flexShrink: 1 }}>
            {mangaInfo.title}
          </span>
        )}

        <select
          value={chapterId}
          onChange={e => navigate(`/reader/${mangaId}/${e.target.value}`)}
          className="chapter-select"
          style={{ flexShrink: 0, fontSize: '0.8rem' }}
        >
          {chapters.map(c => (
            <option key={c.id} value={c.id}>{c.title || `Chapter ${c.chapterNumber}`}</option>
          ))}
        </select>

        {!isLongStrip && (
          <span style={{ color: textDim, fontSize: '0.8rem', flexShrink: 0, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
            {currentPage}{isDouble && currentPage < pages.length ? `–${Math.min(currentPage + 1, pages.length)}` : ''} / {pages.length}
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, flexShrink: 0 }}>
          <button onClick={toggleBookmark} className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: isBookmarked ? 'var(--yellow)' : textColor }}>
            {isBookmarked ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
            {isBookmarked ? 'Saved' : 'Bookmark'}
          </button>
          <button onClick={() => setShowPrefs(s => !s)} className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: showPrefs ? 'var(--accent2)' : textColor }}>
            <Settings size={13} /> Prefs
          </button>
          <button onClick={toggleFullscreen} className="nav-btn" title={`${isFullscreen ? 'Exit' : 'Enter'} Fullscreen (F)`} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', color: isFullscreen ? 'var(--accent2)' : textColor }}>
            {isFullscreen ? <Minimize size={13} /> : <Maximize size={13} />}
            {isFullscreen ? 'Exit' : 'Fullscreen'}
          </button>
        </div>
      </div>

      {/* ── Main area: pages + prefs panel side by side ── */}
      <div style={{ display: 'flex', position: 'relative' }}>

        {/* Left arrow */}
        {!isLongStrip && (
          <button onClick={navLeft}
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', zIndex: 50, background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', height: 80, width: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0 4px 4px 0', transition: 'background 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,110,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
          ><ChevronLeft size={20} /></button>
        )}

        {/* Pages */}
        <div
          onClick={!isLongStrip ? handlePageClick : undefined}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: isLongStrip ? 'column' : 'row',
            justifyContent: 'center',
            alignItems: isLongStrip ? 'center' : 'center',
            minHeight: isLongStrip ? undefined : 'calc(100vh - 120px)',
            gap: isLongStrip ? (prefs.gapBetween ? 4 : 0) : isDouble ? 2 : 0,
            cursor: isLongStrip ? 'default' : 'pointer',
            padding: isLongStrip ? '8px 0 60px' : 0,
            background: bgColor,
          }}
        >
          {visiblePages.map((page, i) => {
            const dbl = isDouble && visiblePages.length === 2;
            return (
              <img
                key={page?.url || i}
                src={page?.url}
                alt={`Page ${currentPage + i}`}
                style={{
                  width: dbl ? '50%' : prefs.fit === 'width' ? '100%' : 'auto',
                  height: prefs.fit === 'height' ? (isLongStrip ? 'auto' : '100vh') : 'auto',
                  maxWidth: prefs.fit === 'original' ? 'none' : dbl ? '50%' : '100%',
                  objectFit: dbl ? 'contain' : undefined,
                  maxHeight: prefs.fit === 'height' ? '100vh' : undefined,
                  display: 'block',
                }}
                onError={e => e.target.src = 'https://placehold.co/800x1200/111/333?text=Failed'}
              />
            );
          })}
        </div>

        {/* Right arrow */}
        {!isLongStrip && (
          <button onClick={navRight}
            style={{ position: 'absolute', right: showPrefs ? 270 : 0, top: '50%', transform: 'translateY(-50%)', zIndex: 50, background: 'rgba(0,0,0,0.4)', border: 'none', color: '#fff', height: 80, width: 38, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px 0 0 4px', transition: 'all 0.25s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,110,255,0.5)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.4)'}
          ><ChevronRight size={20} /></button>
        )}

        {/* ── Preferences panel ── */}
        <div style={{
          width: showPrefs ? 270 : 0,
          minWidth: showPrefs ? 270 : 0,
          overflow: 'hidden',
          transition: 'width 0.25s ease, min-width 0.25s ease',
          background: 'var(--bg2)',
          borderLeft: showPrefs ? '1px solid var(--border)' : 'none',
          display: 'flex', flexDirection: 'column',
          position: 'sticky', top: 0, maxHeight: '100vh',
        }}>
          {showPrefs && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Settings size={15} /> Preferences
                </span>
                <button onClick={() => setShowPrefs(false)} style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', display: 'flex' }}>
                  <X size={17} />
                </button>
              </div>

              <div style={{ padding: '10px 16px', overflowY: 'auto', flex: 1 }}>
                {mangaInfo && (
                  <div style={{ background: 'rgba(91,110,255,0.1)', border: '1px solid rgba(91,110,255,0.25)', borderRadius: 6, padding: '7px 10px', marginBottom: 12, fontSize: '0.75rem', color: 'var(--accent2)' }}>
                    Auto-detected: <strong>
                      {(mangaInfo.tags || []).some(t => ['Long Strip','Webtoon'].includes(t))
                        ? 'Manhwa / Webtoon' : 'Manga'}
                    </strong>
                  </div>
                )}

                <Toggle label="Sticky Top Nav"      checked={prefs.stickyNav}   onChange={() => updatePref('stickyNav', !prefs.stickyNav)} />
                <Toggle label="Gap Between Images"  checked={prefs.gapBetween}  onChange={() => updatePref('gapBetween', !prefs.gapBetween)} />
                <Toggle label="Dark Background"     checked={prefs.darkBg}      onChange={() => updatePref('darkBg', !prefs.darkBg)} />

                <RadioGroup label="Reading Direction" value={prefs.direction} onChange={v => updatePref('direction', v)}
                  options={[
                    { value: 'rtl', label: 'Right to Left (Manga)' },
                    { value: 'ltr', label: 'Left to Right (Manhwa)' },
                  ]}
                />
                <RadioGroup label="Reading Style" value={prefs.style} onChange={v => updatePref('style', v)}
                  options={[
                    { value: 'single',    label: 'Single Page' },
                    { value: 'longstrip', label: 'Long Strip' },
                    { value: 'double',    label: 'Double Page' },
                  ]}
                />
                <RadioGroup label="Image Fit" value={prefs.fit} onChange={v => updatePref('fit', v)}
                  options={[
                    { value: 'width',    label: 'Fit Width' },
                    { value: 'height',   label: 'Fit Height' },
                    { value: 'original', label: 'Original Size' },
                  ]}
                />

                <button
                  onClick={() => { setPrefs(DEFAULT_PREFS); savePrefs(DEFAULT_PREFS); }}
                  style={{ marginTop: 16, width: '100%', background: 'var(--bg4)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '8px', borderRadius: 4, cursor: 'pointer', fontSize: '0.82rem' }}
                >
                  Reset to Defaults
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom bar (non-longstrip) ── */}
      {!isLongStrip && (
        <div style={{ background: barBg, borderTop: `1px solid ${barBorder}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, backdropFilter: 'blur(10px)', transition: 'background 0.2s, border-color 0.2s' }}>
          <button onClick={navLeft} disabled={currentPage === 1 && currentIdx === chapters.length - 1} className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: textColor }}>
            <ArrowLeft size={14} /> {prefs.direction === 'rtl' ? 'Next' : 'Prev'}
          </button>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {pages.slice(Math.max(0, currentPage - 5), Math.min(pages.length, currentPage + 5)).map((_, i) => {
              const pn = Math.max(0, currentPage - 5) + i + 1;
              const active = pn === currentPage;
              return (
                <button key={pn} onClick={() => setCurrentPage(pn)}
                  style={{
                    width: active ? 18 : 7, height: 7,
                    borderRadius: 4, border: 'none',
                    background: active ? 'var(--accent2)' : (prefs.darkBg ? '#444' : '#c8c8c8'),
                    cursor: 'pointer', padding: 0,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
              );
            })}
          </div>
          <button onClick={navRight} disabled={currentPage === pages.length && currentIdx === 0} className="nav-btn" style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.82rem', color: textColor }}>
            {prefs.direction === 'rtl' ? 'Prev' : 'Next'} <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── Back to top — always, bottom-right ── */}
      <button
        onClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth' })}
        title="Back to top"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 500,
          background: 'var(--accent2)', border: 'none', color: '#fff',
          width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        <ArrowUp size={17} />
      </button>
    </div>
  );
}
