const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();

router.post('/', authenticate, (req, res) => {
  const { mangaId, chapterId, pageNumber } = req.body;
  const userId = req.userId;

  if (!mangaId || !chapterId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO bookmarks (user_id, manga_id, chapter_id, page_number)
     VALUES (?, ?, ?, ?)`,
    [userId, mangaId, chapterId, pageNumber || 0],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(400).json({ error: 'Bookmark already exists' });
        }
        return res.status(500).json({ error: 'Failed to create bookmark' });
      }
      res.status(201).json({
        id: this.lastID,
        message: 'Bookmark created'
      });
    }
  );
});

router.get('/', authenticate, (req, res) => {
  const userId = req.userId;

  db.all(
    `SELECT b.*, m.title, m.cover_url, c.title as chapter_title FROM bookmarks b
     JOIN manga m ON b.manga_id = m.id
     JOIN chapters c ON b.chapter_id = c.id
     WHERE b.user_id = ?
     ORDER BY b.created_at DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch bookmarks' });
      }
      res.json({ data: rows || [] });
    }
  );
});

router.delete('/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const userId = req.userId;

  db.run(
    'DELETE FROM bookmarks WHERE id = ? AND user_id = ?',
    [id, userId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete bookmark' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Bookmark not found' });
      }
      res.json({ message: 'Bookmark deleted' });
    }
  );
});

router.get('/manga/:mangaId/bookmarks', authenticate, (req, res) => {
  const { mangaId } = req.params;
  const userId = req.userId;

  db.all(
    `SELECT * FROM bookmarks
     WHERE user_id = ? AND manga_id = ?
     ORDER BY created_at DESC`,
    [userId, mangaId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch bookmarks' });
      }
      res.json({ data: rows || [] });
    }
  );
});

module.exports = router;
