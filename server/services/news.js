const axios = require('axios');
const config = require('../config');
const cache = require('../cache');

async function getNewsData() {
  return cache.cachedJson('news', config.CACHE_TTL.news, async () => {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q="FC Barcelona" OR "Barça"&sortBy=publishedAt&language=en&pageSize=50&apiKey=${config.NEWS_API_KEY}`
    );

    return response.data;
  });
}

module.exports = {
  getNewsData
};
