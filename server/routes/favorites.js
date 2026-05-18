const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

router.post('/:mangaId', authenticate, (req, res) => {
  const { mangaId } = req.params;
  const userId = req.userId;

  db.run(
    `INSERT INTO favorites (user_id, manga_id)
     VALUES (?, ?)`,
    [userId, mangaId],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Already in favorites' });
        }
        return res.status(500).json({ error: 'Failed to add to favorites' });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Added to favorites'
      });
    }
  );
});

router.get('/', authenticate, (req, res) => {
  const userId = req.userId;

  db.all(
    `SELECT f.id, m.* FROM favorites f
     JOIN manga m ON f.manga_id = m.id
     WHERE f.user_id = ?
     ORDER BY f.created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch favorites' });
      }
      res.json({ data: rows || [] });
    }
  );
});

router.delete('/:mangaId', authenticate, (req, res) => {
  const { mangaId } = req.params;
  const userId = req.userId;

  db.run(
    'DELETE FROM favorites WHERE user_id = ? AND manga_id = ?',
    [userId, mangaId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to remove from favorites' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Not in favorites' });
      }
      res.json({ message: 'Removed from favorites' });
    }
  );
});

router.get('/is-favorite/:mangaId', authenticate, (req, res) => {
  const { mangaId } = req.params;
  const userId = req.userId;

  db.get(
    'SELECT id FROM favorites WHERE user_id = ? AND manga_id = ?',
    [userId, mangaId],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check favorite status' });
      }
      res.json({ isFavorite: !!row });
    }
  );
});

module.exports = router;
