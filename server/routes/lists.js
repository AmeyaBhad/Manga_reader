const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware');
const router = express.Router();

router.post('/', authenticate, (req, res) => {
  const { name, description = '', is_public = 1 } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  db.run(`INSERT INTO lists (user_id, name, description, is_public) VALUES (?, ?, ?, ?)`,
    [req.userId, name, description, is_public],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to create list' });
      res.status(201).json({ id: this.lastID, name, message: 'List created' });
    }
  );
});

router.get('/', authenticate, (req, res) => {
  db.all(`SELECT l.*, COUNT(li.id) as item_count FROM lists l
    LEFT JOIN list_items li ON l.id = li.list_id
    WHERE l.user_id = ? GROUP BY l.id ORDER BY l.created_at DESC`,
    [req.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch lists' });
      res.json({ data: rows || [] });
    }
  );
});

router.get('/public', (req, res) => {
  db.all(`SELECT l.*, u.username, COUNT(li.id) as item_count FROM lists l
    JOIN users u ON l.user_id = u.id
    LEFT JOIN list_items li ON l.id = li.list_id
    WHERE l.is_public = 1 GROUP BY l.id ORDER BY l.created_at DESC LIMIT 50`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch lists' });
      res.json({ data: rows || [] });
    }
  );
});

router.get('/:id', (req, res) => {
  db.get('SELECT l.*, u.username FROM lists l JOIN users u ON l.user_id = u.id WHERE l.id = ?',
    [req.params.id], (err, list) => {
      if (err || !list) return res.status(404).json({ error: 'List not found' });
      db.all(`SELECT li.*, m.title, m.cover_url, m.status FROM list_items li
        JOIN manga m ON li.manga_id = m.id WHERE li.list_id = ?`,
        [req.params.id], (err2, items) => {
          if (err2) return res.status(500).json({ error: 'Failed to fetch items' });
          res.json({ ...list, items: items || [] });
        }
      );
    }
  );
});

router.post('/:id/items', authenticate, (req, res) => {
  const { mangaId } = req.body;
  if (!mangaId) return res.status(400).json({ error: 'mangaId required' });
  db.run(`INSERT OR IGNORE INTO list_items (list_id, manga_id) VALUES (?, ?)`,
    [req.params.id, mangaId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add item' });
      res.json({ message: 'Added to list' });
    }
  );
});

router.delete('/:id/items/:mangaId', authenticate, (req, res) => {
  db.run('DELETE FROM list_items WHERE list_id = ? AND manga_id = ?',
    [req.params.id, req.params.mangaId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to remove item' });
      res.json({ message: 'Removed from list' });
    }
  );
});

router.delete('/:id', authenticate, (req, res) => {
  db.run('DELETE FROM lists WHERE id = ? AND user_id = ?', [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to delete list' });
      res.json({ message: 'List deleted' });
    }
  );
});

module.exports = router;
