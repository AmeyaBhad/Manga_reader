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

// Popular this week — weighted score: avg * ln(votes+1), ratings from last 7 days
router.get('/manga/popular-this-week', (req, res) => {
  const { limit = 10 } = req.query;
  db.all(`
    SELECT
      mr.manga_id,
      m.title,
      m.cover_url,
      m.status,
      m.description,
      ROUND(AVG(mr.rating), 1) as avg_rating,
      COUNT(mr.id) as vote_count,
      ROUND(AVG(mr.rating) * LOG(COUNT(mr.id) + 1), 3) as score
    FROM manga_ratings mr
    JOIN manga m ON mr.manga_id = m.id
    WHERE mr.created_at >= datetime('now', '-7 days')
    GROUP BY mr.manga_id
    HAVING vote_count >= 1
    ORDER BY score DESC
    LIMIT ?
  `, [parseInt(limit)], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch popular' });
    res.json({ data: rows || [] });
  });
});

// Public rating stats for any manga (no auth needed)
router.get('/manga/:mangaId/rating/public', (req, res) => {
  db.get('SELECT ROUND(AVG(rating), 1) as avg, COUNT(*) as count FROM manga_ratings WHERE manga_id = ?',
    [req.params.mangaId], (err, stats) => {
      if (err) return res.status(500).json({ error: 'Failed to get rating' });
      res.json({ avgRating: stats?.avg || 0, count: stats?.count || 0 });
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

// Rate a manga (1–10)
router.post('/manga/:mangaId/rate', authenticate, (req, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 10) return res.status(400).json({ error: 'Rating must be 1-10' });
  db.run(`INSERT INTO manga_ratings (user_id, manga_id, rating) VALUES (?, ?, ?)
    ON CONFLICT(user_id, manga_id) DO UPDATE SET rating = excluded.rating, created_at = CURRENT_TIMESTAMP`,
    [req.userId, req.params.mangaId, rating],
    (err) => {
      if (err) return res.status(500).json({ error: 'Failed to rate' });
      // Return updated stats
      db.get('SELECT ROUND(AVG(rating),1) as avg, COUNT(*) as count FROM manga_ratings WHERE manga_id = ?',
        [req.params.mangaId], (err2, stats) => {
          res.json({ message: 'Rating saved', avgRating: stats?.avg || 0, count: stats?.count || 0 });
        }
      );
    }
  );
});

// Get user's own rating + global stats
router.get('/manga/:mangaId/rating', authenticate, (req, res) => {
  db.get('SELECT rating FROM manga_ratings WHERE user_id = ? AND manga_id = ?',
    [req.userId, req.params.mangaId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to get rating' });
      db.get('SELECT ROUND(AVG(rating),1) as avg, COUNT(*) as count FROM manga_ratings WHERE manga_id = ?',
        [req.params.mangaId], (err2, stats) => {
          res.json({ userRating: row?.rating || null, avgRating: stats?.avg || 0, count: stats?.count || 0 });
        }
      );
    }
  );
});

module.exports = router;
