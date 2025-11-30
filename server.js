
// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

app.get('/news', async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=Barcelona+FC&sortBy=publishedAt&language=en&apiKey=${NEWS_API_KEY}`
    );
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
