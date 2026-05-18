const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware');
const router = express.Router();

router.post('/threads', authenticate, (req, res) => {
  const { title, content, category = 'general', manga_id = null } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });
  db.run(`INSERT INTO forum_threads (user_id, manga_id, title, content, category) VALUES (?, ?, ?, ?, ?)`,
    [req.userId, manga_id, title, content, category],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to create thread' });
      res.status(201).json({ id: this.lastID, message: 'Thread created' });
    }
  );
});

router.get('/threads', (req, res) => {
  const { category, manga_id, limit = 20, offset = 0 } = req.query;
  let query = `SELECT ft.*, u.username, COUNT(fr.id) as reply_count
    FROM forum_threads ft JOIN users u ON ft.user_id = u.id
    LEFT JOIN forum_replies fr ON ft.id = fr.thread_id`;
  const params = [];
  const conditions = [];
  if (category) { conditions.push('ft.category = ?'); params.push(category); }
  if (manga_id) { conditions.push('ft.manga_id = ?'); params.push(manga_id); }
  if (conditions.length) query += ' WHERE ' + conditions.join(' AND ');
  query += ' GROUP BY ft.id ORDER BY ft.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));
  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch threads' });
    res.json({ data: rows || [] });
  });
});

router.get('/threads/:id', (req, res) => {
  db.run('UPDATE forum_threads SET views = views + 1 WHERE id = ?', [req.params.id]);
  db.get(`SELECT ft.*, u.username FROM forum_threads ft
    JOIN users u ON ft.user_id = u.id WHERE ft.id = ?`,
    [req.params.id], (err, thread) => {
      if (err || !thread) return res.status(404).json({ error: 'Thread not found' });
      db.all(`SELECT fr.*, u.username FROM forum_replies fr
        JOIN users u ON fr.user_id = u.id WHERE fr.thread_id = ?
        ORDER BY fr.created_at ASC`,
        [req.params.id], (err2, replies) => {
          res.json({ ...thread, replies: replies || [] });
        }
      );
    }
  );
});

router.post('/threads/:id/replies', authenticate, (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Content required' });
  db.run(`INSERT INTO forum_replies (thread_id, user_id, content) VALUES (?, ?, ?)`,
    [req.params.id, req.userId, content],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to post reply' });
      res.status(201).json({ id: this.lastID, message: 'Reply posted' });
    }
  );
});

module.exports = router;
