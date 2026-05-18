const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware');
const router = express.Router();

router.get('/', authenticate, (req, res) => {
  db.all(`SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
    [req.userId], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch notifications' });
      res.json({ data: rows || [] });
    }
  );
});

router.put('/read-all', authenticate, (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.userId], (err) => {
    if (err) return res.status(500).json({ error: 'Failed to mark as read' });
    res.json({ message: 'All notifications marked as read' });
  });
});

router.put('/:id/read', authenticate, (req, res) => {
  db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to mark as read' });
      res.json({ message: 'Notification marked as read' });
    }
  );
});

router.get('/unread-count', authenticate, (req, res) => {
  db.get('SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
    [req.userId], (err, row) => {
      if (err) return res.status(500).json({ error: 'Failed to get count' });
      res.json({ count: row?.count || 0 });
    }
  );
});

module.exports = router;
