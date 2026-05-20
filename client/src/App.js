import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon, Rss, Search as SearchIcon, Sparkles, BookOpen,
  History, Heart, Bookmark, List, MessageSquare, Users, Bell,
  User, LogOut, Shuffle, BookMarked, Layers, Sun, Moon
} from 'lucide-react';
import { AuthProvider, useAuth } from './AuthContext';
import { notificationsAPI, feedAPI } from './api';

import Home from './pages/Home';
import Search from './pages/Search';
import MangaDetail from './pages/MangaDetail';
import Reader from './pages/Reader';
import Login from './pages/Login';
import Register from './pages/Register';
import ReadingHistory from './pages/ReadingHistory';
import Favorites from './pages/Favorites';
import Bookmarks from './pages/Bookmarks';
import Library from './pages/Library';
import Feed from './pages/Feed';
import Lists from './pages/Lists';
import ListDetail from './pages/ListDetail';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Forums from './pages/Forums';
import ThreadDetail from './pages/ThreadDetail';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import UsersPage from './pages/Users';

import './App.css';

// ── Theme Context ──────────────────────────────────────────────
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    if (dark) {
      document.body.classList.remove('light-mode');
    } else {
      document.body.classList.add('light-mode');
    }
  }, [dark]);

  const toggle = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

const useTheme = () => useContext(ThemeContext);

// ── Header ─────────────────────────────────────────────────────
function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const { dark, toggle } = useTheme();
  const [query, setQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;
    notificationsAPI.getUnreadCount().then(r => setUnreadCount(r.data.count)).catch(() => {});
    const iv = setInterval(() => {
      notificationsAPI.getUnreadCount().then(r => setUnreadCount(r.data.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(iv);
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="header">
      <Link to="/" className="header-logo">
        <BookMarked size={20} /> Manga Mania
      </Link>
      <form onSubmit={handleSearch} className="header-search">
        <input placeholder="Search manga..." value={query} onChange={e => setQuery(e.target.value)} />
        <button type="submit"><SearchIcon size={16} /></button>
      </form>
      <div className="header-right">
        <button onClick={toggle} className="btn-ghost icon-btn" title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'} style={{ padding: '6px 10px' }}>
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {isAuthenticated ? (
          <>
            <Link to="/notifications" className="notif-bell">
              <Bell size={18} />
              {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
            </Link>
            <Link to={`/profile/${user?.id}`} className="btn-ghost icon-btn">
              <User size={15} /> {user?.username}
            </Link>
            <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost icon-btn">
              <LogOut size={15} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-ghost">Login</Link>
            <Link to="/register" className="btn-accent">Register</Link>
          </>
        )}
      </div>
    </header>
  );
}

// ── Sidebar ────────────────────────────────────────────────────
function Sidebar() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const item = (to, Icon, label, end = false) => (
    <NavLink to={to} end={end} className={({ isActive }) => 'sidebar-item' + (isActive ? ' active' : '')}>
      <Icon size={16} className="icon" /> {label}
    </NavLink>
  );

  const handleRandom = async () => {
    try { const r = await feedAPI.getRandom(); navigate(`/manga/${r.data.id}`); } catch {}
  };

  return (
    <nav className="sidebar">
      <div className="sidebar-section">
        <div className="sidebar-label">Browse</div>
        {item('/', HomeIcon, 'Home', true)}
        {item('/feed', Rss, 'Feed')}
        {item('/search', SearchIcon, 'Advanced Search')}
        {item('/recently-added', Sparkles, 'Recently Added')}
        <div onClick={handleRandom} className="sidebar-item" style={{ cursor: 'pointer' }}>
          <Shuffle size={16} className="icon" /> Random
        </div>
      </div>
      <div className="sidebar-divider" />
      {isAuthenticated && (
        <>
          <div className="sidebar-section">
            <div className="sidebar-label">My Library</div>
            {item('/library', BookOpen, 'Library')}
            {item('/history', History, 'Reading History')}
            {item('/favorites', Heart, 'Favorites')}
            {item('/bookmarks', Bookmark, 'Bookmarks')}
            {item('/lists', List, 'My Lists')}
          </div>
          <div className="sidebar-divider" />
        </>
      )}
      <div className="sidebar-section">
        <div className="sidebar-label">Community</div>
        {item('/chat', MessageSquare, 'General Chat')}
        {item('/forums', Layers, 'Forums')}
        {item('/groups', Users, 'Groups')}
        {item('/users', User, 'Users')}
      </div>
    </nav>
  );
}

// ── Routes ─────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/recently-added" element={<Feed mode="recent" />} />
      <Route path="/search" element={<Search />} />
      <Route path="/manga/:id" element={<MangaDetail />} />
      <Route path="/reader/:mangaId/:chapterId" element={<Reader />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/history" element={<ReadingHistory />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/bookmarks" element={<Bookmarks />} />
      <Route path="/library" element={<Library />} />
      <Route path="/lists" element={<Lists />} />
      <Route path="/lists/:id" element={<ListDetail />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/groups/:id" element={<GroupDetail />} />
      <Route path="/forums" element={<Forums />} />
      <Route path="/forums/:id" element={<ThreadDetail />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/profile/:id" element={<Profile />} />
      <Route path="/users" element={<UsersPage />} />
    </Routes>
  );
}

// ── App ────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="app-layout">
            <Header />
            <div className="app-body">
              <Sidebar />
              <main className="main-content">
                <AppRoutes />
              </main>
            </div>
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
