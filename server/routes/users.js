const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware');
const router = express.Router();

router.get('/', (req, res) => {
  db.all('SELECT id, username, created_at FROM users ORDER BY created_at DESC LIMIT 50',
    [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch users' });
      res.json({ data: rows || [] });
    }
  );
});

router.get('/:id', (req, res) => {
  db.get('SELECT id, username, bio, avatar, created_at FROM users WHERE id = ?',
    [req.params.id], (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'User not found' });
      db.get('SELECT COUNT(*) as count FROM follows WHERE user_id = ?', [req.params.id], (err2, follows) => {
        db.get('SELECT COUNT(*) as count FROM reading_history WHERE user_id = ?', [req.params.id], (err3, history) => {
          res.json({ ...user, follows_count: follows?.count || 0, read_count: history?.count || 0 });
        });
      });
    }
  );
});

router.put('/profile', authenticate, (req, res) => {
  const { bio } = req.body;
  db.run('UPDATE users SET bio = ? WHERE id = ?', [bio || '', req.userId], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to update profile' });
    res.json({ message: 'Profile updated' });
  });
});

router.post('/manga/:mangaId/rate', authenticate, (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 10) return res.status(400).json({ error: 'Rating must be 1-10' });
  db.run(`INSERT INTO manga_ratings (user_id, manga_id, rating) VALUES (?, ?, ?)
    ON CONFLICT(user_id, manga_id) DO UPDATE SET rating = excluded.rating`,
    [req.userId, req.params.mangaId, rating],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to rate' });
      res.json({ message: 'Rating saved' });
    }
  );
});

router.get('/manga/:mangaId/rating', authenticate, (req, res) => {
  db.get('SELECT rating FROM manga_ratings WHERE user_id = ? AND manga_id = ?',
    [req.userId, req.params.mangaId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to get rating' });
      db.get('SELECT AVG(rating) as avg, COUNT(*) as count FROM manga_ratings WHERE manga_id = ?',
        [req.params.mangaId], (err2, stats) => {
          res.json({ userRating: row?.rating || null, avgRating: Math.round(stats?.avg * 10) / 10 || 0, count: stats?.count || 0 });
        }
      );
    }
  );
});

module.exports = router;
