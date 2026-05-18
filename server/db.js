const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'manga.db'), (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

const initDb = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT DEFAULT NULL,
      bio TEXT DEFAULT '',
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS manga (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      cover_url TEXT,
      status TEXT,
      year INTEGER,
      content_rating TEXT,
      manga_api_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS chapters (
      id TEXT PRIMARY KEY,
      manga_id TEXT NOT NULL,
      chapter_number REAL NOT NULL,
      title TEXT,
      pages INTEGER,
      published_at DATETIME,
      chapter_api_id TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (manga_id) REFERENCES manga(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS reading_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      manga_id TEXT NOT NULL,
      chapter_id TEXT,
      page_number INTEGER DEFAULT 0,
      last_read DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (manga_id) REFERENCES manga(id),
      UNIQUE(user_id, manga_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      manga_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      page_number INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, chapter_id, page_number)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      manga_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, manga_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS follows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      manga_id TEXT NOT NULL,
      status TEXT DEFAULT 'reading',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, manga_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      is_public INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS list_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      manga_id TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (list_id) REFERENCES lists(id),
      UNIQUE(list_id, manga_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      leader_id INTEGER NOT NULL,
      avatar TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (leader_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      role TEXT DEFAULT 'member',
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(group_id, user_id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS forum_threads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      manga_id TEXT DEFAULT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS forum_replies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      thread_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (thread_id) REFERENCES forum_threads(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      room TEXT DEFAULT 'general',
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT DEFAULT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS manga_ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      manga_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 10),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, manga_id)
    )`);

    console.log('Database tables initialized');
  });
};

initDb();
module.exports = db;
