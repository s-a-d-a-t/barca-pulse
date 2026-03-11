
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// serve frontend
app.use(express.static(path.join(__dirname, 'client')));

app.get('/news', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q="FC Barcelona" OR "Barça"&sortBy=publishedAt&language=en&pageSize=50&apiKey=${NEWS_API_KEY}&t=${Date.now()}`
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});