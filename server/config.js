require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  NEWS_API_KEY: process.env.NEWS_API_KEY,
  FOOTBALL_DATA_API_KEY: process.env.FOOTBALL_DATA_API_KEY,
  API_FOOTBALL_KEY: process.env.API_FOOTBALL_KEY,
  NVIDIA_API_KEY: process.env.NVIDIA_API_KEY,

  NVIDIA_INVOKE_URL: process.env.NVIDIA_INVOKE_URL || 'https://integrate.api.nvidia.com/v1/chat/completions',
  NVIDIA_MODEL: process.env.NVIDIA_MODEL || 'nvidia/nemotron-3.5-bolt-e4b',
  NVIDIA_STREAM: process.env.NVIDIA_STREAM === 'true',
  NVIDIA_TEMPERATURE: process.env.NVIDIA_TEMPERATURE !== undefined ? parseFloat(process.env.NVIDIA_TEMPERATURE) : 0.3,
  NVIDIA_TOP_P: process.env.NVIDIA_TOP_P !== undefined ? parseFloat(process.env.NVIDIA_TOP_P) : 0.9,
  NVIDIA_MAX_TOKENS: process.env.NVIDIA_MAX_TOKENS !== undefined ? parseInt(process.env.NVIDIA_MAX_TOKENS, 10) : 1024,
  NVIDIA_SEED: process.env.NVIDIA_SEED !== undefined ? parseInt(process.env.NVIDIA_SEED, 10) : 42,
  NVIDIA_ENABLE_THINKING: process.env.NVIDIA_ENABLE_THINKING !== 'false',

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
