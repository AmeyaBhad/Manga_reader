const express = require('express');
const axios = require('axios');
const db = require('../db');
const { authenticate } = require('../middleware');
const router = express.Router();

const MANGADEX_API = 'https://api.mangadex.org';
const getCoverUrl = (manga) => {
  const cover = manga.relationships?.find(r => r.type === 'cover_art');
  return cover ? `https://uploads.mangadex.org/covers/${manga.id}/${cover.attributes.fileName}` : null;
};

router.get('/latest', async (req, res) => {
  try {
    const { limit = 24 } = req.query;
    const response = await axios.get(`${MANGADEX_API}/chapter`, {
      params: { limit, offset: 0, includes: ['manga'], 'translatedLanguage[]': 'en',
        order: { publishAt: 'desc' } }
    });
    const chapters = response.data.data.map(ch => {
      const mangaRel = ch.relationships?.find(r => r.type === 'manga');
      return {
        id: ch.id,
        chapter: ch.attributes.chapter,
        title: ch.attributes.title,
        publishedAt: ch.attributes.publishAt,
        mangaId: mangaRel?.id,
        mangaTitle: mangaRel?.attributes?.title?.en || Object.values(mangaRel?.attributes?.title || {})[0]
      };
    });
    res.json({ data: chapters });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch latest updates' });
  }
});

router.get('/recently-added', async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const response = await axios.get(`${MANGADEX_API}/manga`, {
      params: { limit, includes: ['cover_art'], order: { createdAt: 'desc' } }
    });
    const manga = response.data.data.map(m => ({
      id: m.id,
      title: m.attributes.title.en || Object.values(m.attributes.title)[0],
      cover: getCoverUrl(m),
      status: m.attributes.status,
      year: m.attributes.year,
      createdAt: m.attributes.createdAt
    }));
    res.json({ data: manga });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recently added' });
  }
});

router.get('/random', async (req, res) => {
  try {
    const response = await axios.get(`${MANGADEX_API}/manga/random`, {
      params: { includes: ['cover_art'] }
    });
    const m = response.data.data;
    res.json({
      id: m.id,
      title: m.attributes.title.en || Object.values(m.attributes.title)[0],
      cover: getCoverUrl(m),
      status: m.attributes.status
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch random manga' });
  }
});

router.get('/my-feed', authenticate, async (req, res) => {
  try {
    db.all('SELECT manga_id FROM follows WHERE user_id = ? LIMIT 20', [req.userId], async (err, follows) => {
      if (err || !follows?.length) return res.json({ data: [] });
      const mangaIds = follows.map(f => f.manga_id);
      const params = {};
      mangaIds.forEach((id, i) => { params[`ids[${i}]`] = id; });
      const response = await axios.get(`${MANGADEX_API}/chapter`, {
        params: { ...params, limit: 30, 'translatedLanguage[]': 'en', order: { publishAt: 'desc' } }
      });
      const chapters = response.data.data.map(ch => ({
        id: ch.id,
        chapter: ch.attributes.chapter,
        title: ch.attributes.title,
        publishedAt: ch.attributes.publishAt,
        mangaId: ch.relationships?.find(r => r.type === 'manga')?.id
      }));
      res.json({ data: chapters });
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

module.exports = router;
