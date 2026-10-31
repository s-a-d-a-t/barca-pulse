const express = require('express');
const router = express.Router();
const newsService = require('./services/news');
const footballService = require('./services/football');
const chatService = require('./services/chat');

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

// Chat endpoint for BarcaBot (supports both /api/chat and legacy /api/rag/query)
router.post(['/api/chat', '/api/rag/query'], express.json(), async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message query is required.' });
    }
    const response = await chatService.generateChatResponse(message, history || []);
    res.json(response);
  } catch (err) {
    res.status(500).json({
      message: 'Error executing chat query',
      error: err.message,
    });
  }
});

// Legacy RAG index endpoint (decommissioned)
router.post('/api/rag/index', async (req, res) => {
  res.json({
    success: true,
    message: 'Vector RAG indexing has been eliminated in favor of direct bounded prompting.'
  });
});

module.exports = router;

