const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const db = require('./db');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const mangaRoutes = require('./routes/manga');
const chapterRoutes = require('./routes/chapters');
const bookmarkRoutes = require('./routes/bookmarks');
const favoriteRoutes = require('./routes/favorites');
const followsRoutes = require('./routes/follows');
const listsRoutes = require('./routes/lists');
const groupsRoutes = require('./routes/groups');
const forumsRoutes = require('./routes/forums');
const notificationsRoutes = require('./routes/notifications');
const usersRoutes = require('./routes/users');
const feedRoutes = require('./routes/feed');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000', methods: ['GET', 'POST'] }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/manga', mangaRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/follows', followsRoutes);
app.use('/api/lists', listsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/forums', forumsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/feed', feedRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const chatRooms = {};

io.on('connection', (socket) => {
  socket.on('join-room', ({ room, username }) => {
    socket.join(room);
    socket.username = username;
    socket.room = room;
    if (!chatRooms[room]) chatRooms[room] = [];
    socket.emit('chat-history', chatRooms[room].slice(-50));
    socket.to(room).emit('user-joined', { username, room });
  });

  socket.on('send-message', ({ room, message, userId }) => {
    const msgData = {
      id: Date.now(),
      username: socket.username,
      message,
      room,
      createdAt: new Date().toISOString()
    };
    if (!chatRooms[room]) chatRooms[room] = [];
    chatRooms[room].push(msgData);
    if (chatRooms[room].length > 100) chatRooms[room].shift();

    if (userId) {
      db.run('INSERT INTO chat_messages (user_id, room, message) VALUES (?, ?, ?)',
        [userId, room, message]);
    }
    io.to(room).emit('new-message', msgData);
  });

  socket.on('disconnect', () => {
    if (socket.room) {
      socket.to(socket.room).emit('user-left', { username: socket.username });
    }
  });
});

server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
