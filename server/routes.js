const express = require('express');
const router = express.Router();
const newsService = require('./services/news');
const footballService = require('./services/football');

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

module.exports = router;
