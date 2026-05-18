import React from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';

import Home from './pages/Home';
import Search from './pages/Search';
import MangaDetail from './pages/MangaDetail';
import Reader from './pages/Reader';
import Login from './pages/Login';
import Register from './pages/Register';
import ReadingHistory from './pages/ReadingHistory';
import Favorites from './pages/Favorites';
import Bookmarks from './pages/Bookmarks';

import './App.css';

function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <nav className="container">
        <Link to="/" className="logo">
          📚 Manga Reader
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/search">Search</Link>
          </li>
          {isAuthenticated && (
            <>
              <li>
                <Link to="/history">History</Link>
              </li>
              <li>
                <Link to="/favorites">Favorites</Link>
              </li>
              <li>
                <Link to="/bookmarks">Bookmarks</Link>
              </li>
            </>
          )}
        </ul>

        <div className="auth-buttons">
          {isAuthenticated ? (
            <>
              <span style={{ display: 'flex', alignItems: 'center', marginRight: '1rem' }}>
                Hi, {user?.username}!
              </span>
              <button onClick={handleLogout} className="btn-primary-outline">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary-outline">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/manga/:id" element={<MangaDetail />} />
      <Route path="/reader/:mangaId/:chapterId" element={<Reader />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/history" element={<ReadingHistory />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/bookmarks" element={<Bookmarks />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <main style={{ minHeight: 'calc(100vh - 80px)' }}>
          <AppRoutes />
        </main>
        <footer style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)', padding: '2rem 0', marginTop: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <p>&copy; 2024 Manga Reader. Powered by MangaDex API.</p>
        </footer>
      </AuthProvider>
    </BrowserRouter>
  );
}
