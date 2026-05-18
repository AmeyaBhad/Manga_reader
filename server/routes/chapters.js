const express = require('express');
const axios = require('axios');
const db = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();
const MANGADEX_API = 'https://api.mangadex.org';

router.get('/manga/:mangaId', async (req, res) => {
  try {
    const { mangaId } = req.params;
    const { limit = 100, offset = 0 } = req.query;

    const response = await axios.get(`${MANGADEX_API}/manga/${mangaId}/feed`, {
      params: {
        limit,
        offset,
        order: { chapter: 'desc' },
        includes: [],
        'translatedLanguage[]': 'en'
      }
    });

    const chapters = response.data.data.map(ch => ({
      id: ch.id,
      mangaId,
      chapterNumber: parseFloat(ch.attributes.chapter) || 0,
      title: ch.attributes.title || `Chapter ${ch.attributes.chapter}`,
      pages: ch.attributes.pages,
      publishedAt: ch.attributes.publishAt
    }));

    chapters.forEach(ch => {
      db.run(
        `INSERT OR IGNORE INTO chapters (id, manga_id, chapter_number, title, pages, published_at, chapter_api_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [ch.id, mangaId, ch.chapterNumber, ch.title, ch.pages, ch.publishedAt, ch.id],
        (err) => {
          if (err) console.log('Chapter save error:', err);
        }
      );
    });

    res.json({
      data: chapters,
      total: response.data.total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('Chapters error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

router.get('/:chapterId/pages', async (req, res) => {
  try {
    const { chapterId } = req.params;

    const response = await axios.get(`${MANGADEX_API}/at-home/server/${chapterId}`);
    const chapter = response.data.chapter;
    const baseUrl = response.data.baseUrl;

    const pages = chapter.data.map((page, index) => ({
      pageNum: index + 1,
      url: `${baseUrl}/data/${chapter.hash}/${page}`
    }));

    res.json({
      pages,
      total: pages.length
    });
  } catch (err) {
    console.error('Pages error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chapter pages' });
  }
});

router.post('/reading-history', authenticate, (req, res) => {
  const { mangaId, chapterId, pageNumber } = req.body;
  const userId = req.userId;

  if (!mangaId) {
    return res.status(400).json({ error: 'Missing mangaId' });
  }

  db.run(
    `INSERT INTO reading_history (user_id, manga_id, chapter_id, page_number, last_read)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(user_id, manga_id) DO UPDATE SET
     chapter_id = excluded.chapter_id,
     page_number = excluded.page_number,
     last_read = CURRENT_TIMESTAMP`,
    [userId, mangaId, chapterId || null, pageNumber || 0],
    (err) => {
      if (err) {
        console.error('History save error:', err);
        return res.status(500).json({ error: 'Failed to save reading history' });
      }
      res.json({ message: 'Reading history saved' });
    }
  );
});

router.get('/reading-history', authenticate, (req, res) => {
  const userId = req.userId;

  db.all(
    `SELECT rh.*, m.title, m.cover_url FROM reading_history rh
     JOIN manga m ON rh.manga_id = m.id
     WHERE rh.user_id = ?
     ORDER BY rh.last_read DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch reading history' });
      }
      res.json({ data: rows || [] });
    }
  );
});

module.exports = router;
