import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (username, password) =>
    api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me')
};

export const mangaAPI = {
  search: (query, limit = 12, offset = 0) =>
    api.get('/manga/search', { params: { query, limit, offset } }),
  getTrending: (limit = 12) =>
    api.get('/manga/trending', { params: { limit } }),
  getDetails: (id) =>
    api.get(`/manga/${id}`)
};

export const chapterAPI = {
  getChapters: (mangaId, limit = 100, offset = 0) =>
    api.get(`/chapters/manga/${mangaId}`, { params: { limit, offset } }),
  getPages: (chapterId) =>
    api.get(`/chapters/${chapterId}/pages`),
  saveHistory: (mangaId, chapterId, pageNumber) =>
    api.post('/chapters/reading-history', { mangaId, chapterId, pageNumber }),
  getHistory: () =>
    api.get('/chapters/reading-history')
};

export const bookmarkAPI = {
  create: (mangaId, chapterId, pageNumber) =>
    api.post('/bookmarks', { mangaId, chapterId, pageNumber }),
  getAll: () =>
    api.get('/bookmarks'),
  getByManga: (mangaId) =>
    api.get(`/bookmarks/manga/${mangaId}/bookmarks`),
  delete: (id) =>
    api.delete(`/bookmarks/${id}`)
};

export const favoriteAPI = {
  add: (mangaId) =>
    api.post(`/favorites/${mangaId}`),
  getAll: () =>
    api.get('/favorites'),
  remove: (mangaId) =>
    api.delete(`/favorites/${mangaId}`),
  isFavorite: (mangaId) =>
    api.get(`/favorites/is-favorite/${mangaId}`)
};

export default api;
