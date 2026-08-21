const express = require('express');
const router = express.Router();
const newsService = require('./services/news');
const footballService = require('./services/football');
const ragService = require('./services/rag');
const ragIndexer = require('./services/ragIndexer');

router.get('/news', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const data = await newsService.getNewsData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
});

router.get('/api/players', async (req, res) => {
  try {
    const data = await footballService.getApiFootballPlayers();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching player data',
      error: err.message,
    });
  }
});

router.get('/api/players/:id', async (req, res) => {
  try {
    const player = await footballService.getPlayerDetails(req.params.id);
    if (!player) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json({ player });
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching player details',
      error: err.message,
    });
  }
});

router.get('/api/lineup', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  try {
    const data = await footballService.getLatestLineup();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching lineup data',
      error: err.message,
    });
  }
});

router.get('/api/fixtures', async (req, res) => {
  try {
    const data = await footballService.getUpcomingFixtures();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching fixtures',
      error: err.message,
    });
  }
});

router.post('/api/rag/query', express.json(), async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message query is required.' });
    }
    const response = await ragService.queryRAG(message, history || []);
    res.json(response);
  } catch (err) {
    res.status(500).json({
      message: 'Error executing RAG query',
      error: err.message,
    });
  }
});

router.post('/api/rag/index', async (req, res) => {
  try {
    const result = await ragIndexer.indexAllData();
    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: 'Error rebuilding RAG index',
      error: err.message,
    });
  }
});

module.exports = router;

