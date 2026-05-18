const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mangaRoutes = require('./routes/manga');
const chapterRoutes = require('./routes/chapters');
const bookmarkRoutes = require('./routes/bookmarks');
const favoriteRoutes = require('./routes/favorites');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/manga', mangaRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/favorites', favoriteRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
