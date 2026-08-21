require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
  FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY,
  API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,

  GEMINI_MODELS: {
    embedding: 'gemini-embedding-001',
    chat: 'gemini-3.5-flash'
  },
  
  ENABLE_SEARCH_GROUNDING: process.env.ENABLE_SEARCH_GROUNDING === 'true',

  API_FOOTBALL_BASE_URL: 'https://v3.football.api-sports.io',
  FOOTBALL_DATA_BASE_URL: 'https://api.football-data.org/v4',
  BARCA_API_FOOTBALL_TEAM_ID: 529,
  BARCA_FOOTBALL_DATA_TEAM_ID: 81,

  CACHE_TTL: {
    news: 30 * 60 * 1000,
    players: 60 * 60 * 1000,
    lineup: 30 * 60 * 1000,
    lineupFixture: 12 * 60 * 60 * 1000,
    fixtures: 45 * 60 * 1000,
  }
};
