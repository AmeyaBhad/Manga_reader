import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  login: (username, password) => api.post('/auth/login', { username, password }),
  getMe: () => api.get('/auth/me')
};

export const mangaAPI = {
  search: (query, limit = 12, offset = 0) => api.get('/manga/search', { params: { query, limit, offset } }),
  getTrending: (limit = 12) => api.get('/manga/trending', { params: { limit } }),
  getDetails: (id) => api.get(`/manga/${id}`)
};

export const chapterAPI = {
  getChapters: (mangaId, limit = 100, offset = 0) => api.get(`/chapters/manga/${mangaId}`, { params: { limit, offset } }),
  getPages: (chapterId) => api.get(`/chapters/${chapterId}/pages`),
  saveHistory: (mangaId, chapterId, pageNumber) => api.post('/chapters/reading-history', { mangaId, chapterId, pageNumber }),
  getHistory: () => api.get('/chapters/reading-history')
};

export const bookmarkAPI = {
  create: (mangaId, chapterId, pageNumber) => api.post('/bookmarks', { mangaId, chapterId, pageNumber }),
  getAll: () => api.get('/bookmarks'),
  getByManga: (mangaId) => api.get(`/bookmarks/manga/${mangaId}/bookmarks`),
  delete: (id) => api.delete(`/bookmarks/${id}`)
};

export const favoriteAPI = {
  add: (mangaId) => api.post(`/favorites/${mangaId}`),
  getAll: () => api.get('/favorites'),
  remove: (mangaId) => api.delete(`/favorites/${mangaId}`),
  isFavorite: (mangaId) => api.get(`/favorites/is-favorite/${mangaId}`)
};

export const followsAPI = {
  follow: (mangaId, status = 'reading') => api.post(`/follows/${mangaId}`, { status }),
  unfollow: (mangaId) => api.delete(`/follows/${mangaId}`),
  getAll: (status) => api.get('/follows', { params: status ? { status } : {} }),
  getStatus: (mangaId) => api.get(`/follows/status/${mangaId}`)
};

export const listsAPI = {
  create: (name, description, is_public = 1) => api.post('/lists', { name, description, is_public }),
  getAll: () => api.get('/lists'),
  getPublic: () => api.get('/lists/public'),
  getById: (id) => api.get(`/lists/${id}`),
  addItem: (listId, mangaId) => api.post(`/lists/${listId}/items`, { mangaId }),
  removeItem: (listId, mangaId) => api.delete(`/lists/${listId}/items/${mangaId}`),
  delete: (id) => api.delete(`/lists/${id}`)
};

export const groupsAPI = {
  create: (name, description) => api.post('/groups', { name, description }),
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
  join: (id) => api.post(`/groups/${id}/join`),
  leave: (id) => api.post(`/groups/${id}/leave`)
};

export const forumsAPI = {
  createThread: (title, content, category, manga_id) => api.post('/forums/threads', { title, content, category, manga_id }),
  getThreads: (category, manga_id) => api.get('/forums/threads', { params: { category, manga_id } }),
  getThread: (id) => api.get(`/forums/threads/${id}`),
  reply: (threadId, content) => api.post(`/forums/threads/${threadId}/replies`, { content })
};

export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  readAll: () => api.put('/notifications/read-all'),
  read: (id) => api.put(`/notifications/${id}/read`)
};

export const usersAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (bio) => api.put('/users/profile', { bio }),
  rateManga: (mangaId, rating) => api.post(`/users/manga/${mangaId}/rate`, { rating }),
  getMangaRating: (mangaId) => api.get(`/users/manga/${mangaId}/rating`),
  getPublicRating: (mangaId) => api.get(`/users/manga/${mangaId}/rating/public`),
  getPopularThisWeek: (limit = 10) => api.get('/users/manga/popular-this-week', { params: { limit } })
};

export const feedAPI = {
  getLatest: (limit = 24) => api.get('/feed/latest', { params: { limit } }),
  getRecentlyAdded: (limit = 12) => api.get('/feed/recently-added', { params: { limit } }),
  getRandom: () => api.get('/feed/random'),
  getMyFeed: () => api.get('/feed/my-feed')
};

export default api;
