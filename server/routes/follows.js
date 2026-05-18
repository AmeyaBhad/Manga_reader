const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware');
const router = express.Router();

router.post('/:mangaId', authenticate, (req, res) => {
  const { mangaId } = req.params;
  const { status = 'reading' } = req.body;
  const userId = req.userId;
  const validStatuses = ['reading', 'completed', 'on_hold', 'dropped', 'plan_to_read'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' });

  db.run(`INSERT INTO follows (user_id, manga_id, status) VALUES (?, ?, ?)
    ON CONFLICT(user_id, manga_id) DO UPDATE SET status = excluded.status`,
    [userId, mangaId, status],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to follow manga' });
      res.json({ message: 'Follow updated', status });
    }
  );
});

router.delete('/:mangaId', authenticate, (req, res) => {
  const { mangaId } = req.params;
  db.run('DELETE FROM follows WHERE user_id = ? AND manga_id = ?', [req.userId, mangaId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to unfollow' });
      res.json({ message: 'Unfollowed' });
    }
  );
});

router.get('/', authenticate, (req, res) => {
  const { status } = req.query;
  let query = `SELECT f.*, m.title, m.cover_url, m.status as manga_status FROM follows f
    JOIN manga m ON f.manga_id = m.id WHERE f.user_id = ?`;
  const params = [req.userId];
  if (status) { query += ' AND f.status = ?'; params.push(status); }
  query += ' ORDER BY f.created_at DESC';
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch follows' });
    res.json({ data: rows || [] });
  });
});

router.get('/status/:mangaId', authenticate, (req, res) => {
  db.get('SELECT status FROM follows WHERE user_id = ? AND manga_id = ?',
    [req.userId, req.params.mangaId],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to check' });
      res.json({ following: !!row, status: row?.status || null });
    }
  );
});

module.exports = router;
