const express = require('express');
const axios = require('axios');
const db = require('../db');
const { authenticate } = require('../middleware');

const router = express.Router();
const MANGADEX_API = 'https://api.mangadex.org/manga';

const getCoverUrl = (manga) => {
  if (manga.relationships) {
    const coverArt = manga.relationships.find(r => r.type === 'cover_art');
    if (coverArt) {
      return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}`;
    }
  }
  return null;
};

const saveMangaToDb = (mangaData) => {
  return new Promise((resolve, reject) => {
    const { id, title, description, cover, status, year, contentRating } = mangaData;

    db.run(
      `INSERT OR IGNORE INTO manga (id, title, description, cover_url, status, year, content_rating, manga_api_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, title, description, cover, status, year, contentRating, id],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

router.get('/search', async (req, res) => {
  try {
    const { query, limit = 12, offset = 0 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const response = await axios.get(MANGADEX_API, {
      params: {
        title: query,
        limit,
        offset,
        includes: ['cover_art']
      }
    });

    const manga = response.data.data.map(m => ({
      id: m.id,
      title: m.attributes.title.en || Object.values(m.attributes.title)[0],
      description: m.attributes.description.en || '',
      cover: getCoverUrl(m),
      status: m.attributes.status,
      year: m.attributes.year,
      contentRating: m.attributes.contentRating
    }));

    manga.forEach(m => saveMangaToDb(m).catch(err => console.log('Save error:', err)));

    res.json({
      data: manga,
      total: response.data.total,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (err) {
    console.error('Search error:', err.message);
    res.status(500).json({ error: 'Failed to search manga' });
  }
});

router.get('/trending', async (req, res) => {
  try {
    const { limit = 12 } = req.query;

    const response = await axios.get(MANGADEX_API, {
      params: {
        limit,
        offset: 0,
        includes: ['cover_art'],
        order: { rating: 'desc' }
      }
    });

    const manga = response.data.data.map(m => ({
      id: m.id,
      title: m.attributes.title.en || Object.values(m.attributes.title)[0],
      description: m.attributes.description.en || '',
      cover: getCoverUrl(m),
      status: m.attributes.status,
      year: m.attributes.year,
      contentRating: m.attributes.contentRating
    }));

    manga.forEach(m => saveMangaToDb(m).catch(err => console.log('Save error:', err)));

    res.json({ data: manga });
  } catch (err) {
    console.error('Trending error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending manga' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${MANGADEX_API}/${id}`, {
      params: {
        includes: ['author', 'artist', 'cover_art']
      }
    });

    const m = response.data.data;
    const manga = {
      id: m.id,
      title: m.attributes.title.en || Object.values(m.attributes.title)[0],
      description: m.attributes.description.en || '',
      cover: getCoverUrl(m),
      status: m.attributes.status,
      year: m.attributes.year,
      contentRating: m.attributes.contentRating,
      tags: m.attributes.tags.map(t => t.attributes.name.en || ''),
      authors: m.relationships
        .filter(r => r.type === 'author')
        .map(r => r.attributes?.name || 'Unknown'),
      artists: m.relationships
        .filter(r => r.type === 'artist')
        .map(r => r.attributes?.name || 'Unknown')
    };

    saveMangaToDb(manga).catch(err => console.log('Save error:', err));

    res.json(manga);
  } catch (err) {
    console.error('Manga detail error:', err.message);
    res.status(500).json({ error: 'Failed to fetch manga details' });
  }
});

module.exports = router;
