const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, 'manga.db'), (err) => {
  if (err) console.error('Database connection error:', err);
  else console.log('Connected to SQLite database');
});

const initDb = () => {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS manga (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        cover_url TEXT,
        status TEXT,
        year INTEGER,
        content_rating TEXT,
        manga_api_id TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS chapters (
        id TEXT PRIMARY KEY,
        manga_id TEXT NOT NULL,
        chapter_number REAL NOT NULL,
        title TEXT,
        pages INTEGER,
        published_at DATETIME,
        chapter_api_id TEXT UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (manga_id) REFERENCES manga(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reading_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        manga_id TEXT NOT NULL,
        chapter_id TEXT,
        page_number INTEGER DEFAULT 0,
        last_read DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (manga_id) REFERENCES manga(id),
        FOREIGN KEY (chapter_id) REFERENCES chapters(id),
        UNIQUE(user_id, manga_id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        manga_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        page_number INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (manga_id) REFERENCES manga(id),
        FOREIGN KEY (chapter_id) REFERENCES chapters(id),
        UNIQUE(user_id, chapter_id, page_number)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        manga_id TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (manga_id) REFERENCES manga(id),
        UNIQUE(user_id, manga_id)
      )
    `);

    console.log('Database tables initialized');
  });
};

initDb();

module.exports = db;
