const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware');
const router = express.Router();

router.post('/', authenticate, (req, res) => {
  const { name, description = '' } = req.body;
  if (!name) return res.status(400).json({ error: 'Name required' });
  db.run(`INSERT INTO groups (name, description, leader_id) VALUES (?, ?, ?)`,
    [name, description, req.userId],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(400).json({ error: 'Group name taken' });
        return res.status(500).json({ error: 'Failed to create group' });
      }
      const groupId = this.lastID;
      db.run(`INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'leader')`,
        [groupId, req.userId]);
      res.status(201).json({ id: groupId, name, message: 'Group created' });
    }
  );
});

router.get('/', (req, res) => {
  db.all(`SELECT g.*, u.username as leader_name, COUNT(gm.id) as member_count
    FROM groups g JOIN users u ON g.leader_id = u.id
    LEFT JOIN group_members gm ON g.id = gm.group_id
    GROUP BY g.id ORDER BY g.created_at DESC`,
    [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch groups' });
      res.json({ data: rows || [] });
    }
  );
});

router.get('/:id', (req, res) => {
  db.get(`SELECT g.*, u.username as leader_name FROM groups g
    JOIN users u ON g.leader_id = u.id WHERE g.id = ?`,
    [req.params.id], (err, group) => {
      if (err || !group) return res.status(404).json({ error: 'Group not found' });
      db.all(`SELECT gm.*, u.username FROM group_members gm
        JOIN users u ON gm.user_id = u.id WHERE gm.group_id = ?`,
        [req.params.id], (err2, members) => {
          res.json({ ...group, members: members || [] });
        }
      );
    }
  );
});

router.post('/:id/join', authenticate, (req, res) => {
  db.run(`INSERT OR IGNORE INTO group_members (group_id, user_id) VALUES (?, ?)`,
    [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to join group' });
      res.json({ message: 'Joined group' });
    }
  );
});

router.post('/:id/leave', authenticate, (req, res) => {
  db.run(`DELETE FROM group_members WHERE group_id = ? AND user_id = ?`,
    [req.params.id, req.userId],
    function(err) {
      if (err) return res.status(500).json({ error: 'Failed to leave group' });
      res.json({ message: 'Left group' });
    }
  );
});

module.exports = router;
