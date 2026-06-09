const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const FOOTBALL_DATA_API_KEY = process.env.FOOTBALL_DATA_API_KEY;
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

const API_FOOTBALL_BASE_URL = 'https://v3.football.api-sports.io';
const FOOTBALL_DATA_BASE_URL = 'https://api.football-data.org/v4';
const BARCA_API_FOOTBALL_TEAM_ID = 529;
const BARCA_FOOTBALL_DATA_TEAM_ID = 81;

const CACHE_TTL = {
  news: 30 * 60 * 1000,
  players: 60 * 60 * 1000,
  lineup: 30 * 60 * 1000,
  fixtures: 45 * 60 * 1000,
};

const cache = new Map();

app.use(express.static(path.join(__dirname, 'client')));

function getCurrentSeasonStartYear() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();

  return month >= 6 ? year : year - 1;
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - dob.getUTCMonth();

  if (monthDelta < 0 || (monthDelta === 0 && now.getUTCDate() < dob.getUTCDate())) {
    age -= 1;
  }

  return age;
}

async function cachedJson(key, ttlMs, fetcher) {
  const cached = cache.get(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const data = await fetcher();
    cache.set(key, {
      data,
      expiresAt: now + ttlMs,
    });
    return data;
  } catch (error) {
    if (cached) {
      return cached.data;
    }
    throw error;
  }
}

async function getNewsData() {
  return cachedJson('news', CACHE_TTL.news, async () => {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q="FC Barcelona" OR "Barça"&sortBy=publishedAt&language=en&pageSize=50&apiKey=${NEWS_API_KEY}`
    );

    return response.data;
  });
}

async function getApiFootball(pathname, params = {}) {
  const response = await axios.get(`${API_FOOTBALL_BASE_URL}${pathname}`, {
    params,
    headers: {
      'x-apisports-key': API_FOOTBALL_KEY,
    },
    timeout: 20000,
  });

  return response.data;
}

async function getFootballData(pathname, params = {}) {
  const response = await axios.get(`${FOOTBALL_DATA_BASE_URL}${pathname}`, {
    params,
    headers: {
      'X-Auth-Token': FOOTBALL_DATA_API_KEY,
    },
    timeout: 20000,
  });

  return response.data;
}

async function getApiFootballPlayers() {
  return cachedJson('players', CACHE_TTL.players, async () => {
    const season = getCurrentSeasonStartYear();
    const squadPayload = await getApiFootball('/players/squads', {
      team: BARCA_API_FOOTBALL_TEAM_ID,
    });

    const squadPlayers = Array.isArray(squadPayload.response?.[0]?.players)
      ? squadPayload.response[0].players
      : [];

    const normalizedPlayers = [];

    for (const squadPlayer of squadPlayers) {
      let stats = {};

      try {
        const playerPayload = await getApiFootball('/players', {
          id: squadPlayer.id,
          season,
        });

        const playerEntry = Array.isArray(playerPayload.response) ? playerPayload.response[0] : null;
        stats = Array.isArray(playerEntry?.statistics) && playerEntry.statistics.length > 0
          ? playerEntry.statistics[0]
          : {};
      } catch (error) {
        stats = {};
      }

      const games = stats.games || {};
      const goals = stats.goals || {};
      const cards = stats.cards || {};
      const passes = stats.passes || {};

      normalizedPlayers.push({
        id: squadPlayer.id,
        name: squadPlayer.name || 'Unknown Player',
        photo: squadPlayer.photo || `https://media.api-sports.io/football/players/${squadPlayer.id}.png`,
        age: squadPlayer.age ?? calculateAge(squadPlayer.birth?.date || squadPlayer.birthdate || squadPlayer.dateOfBirth),
        nationality: squadPlayer.nationality || 'Unknown',
        position: squadPlayer.position || 'Unknown',
        shirtNumber: squadPlayer.number ?? squadPlayer.shirtNumber ?? null,
        appearances: games.appearences ?? games.appearances ?? 0,
        goals: goals.total ?? 0,
        assists: passes.assists ?? 0,
        minutesPlayed: games.minutes ?? 0,
        yellowCards: cards.yellow ?? 0,
        redCards: cards.red ?? 0,
        rating: games.rating ? Number.parseFloat(games.rating) : null,
        stats: {
          starts: games.lineups ?? 0,
          substitutes: games.substitutes ?? 0,
          rating: games.rating ? Number.parseFloat(games.rating) : null,
        },
      });
    }

    normalizedPlayers.sort((a, b) => {
      const aNumber = Number.isFinite(a.shirtNumber) ? a.shirtNumber : 999;
      const bNumber = Number.isFinite(b.shirtNumber) ? b.shirtNumber : 999;
      return aNumber - bNumber;
    });

    return {
      season,
      team: {
        id: BARCA_API_FOOTBALL_TEAM_ID,
        name: 'FC Barcelona',
      },
      players: normalizedPlayers,
    };
  });
}

function parseGrid(grid) {
  if (!grid || typeof grid !== 'string' || !grid.includes(':')) {
    return null;
  }

  const [row, column] = grid.split(':').map((value) => Number.parseInt(value, 10));
  if (Number.isNaN(row) || Number.isNaN(column)) {
    return null;
  }

  return { row, column };
}

function normalizeLineupPlayer(entry) {
  const player = entry.player || entry;
  return {
    id: player.id,
    name: player.name,
    number: player.number ?? player.shirtNumber ?? null,
    position: player.pos || player.position || 'Unknown',
    grid: parseGrid(entry.grid || player.grid || null),
  };
}

function normalizeLineupResponse(fixture, lineupEntry) {
  return {
    fixtureId: fixture?.fixture?.id || null,
    fixtureDate: fixture?.fixture?.date || fixture?.fixture?.utcDate || null,
    opponent:
      fixture?.teams?.home?.id === BARCA_API_FOOTBALL_TEAM_ID
        ? fixture?.teams?.away?.name
        : fixture?.teams?.home?.name,
    formation: lineupEntry?.formation || '4-3-3',
    coach: lineupEntry?.coach?.name || 'Unknown Coach',
    team: lineupEntry?.team?.name || 'FC Barcelona',
    startXI: Array.isArray(lineupEntry?.startXI)
      ? lineupEntry.startXI.map(normalizeLineupPlayer)
      : [],
    bench: Array.isArray(lineupEntry?.substitutes)
      ? lineupEntry.substitutes.map(normalizeLineupPlayer)
      : [],
  };
}

async function getLatestLineup() {
  return cachedJson('lineup', CACHE_TTL.lineup, async () => {
    const season = getCurrentSeasonStartYear();
    const fixturesPayload = await getApiFootball('/fixtures', {
      team: BARCA_API_FOOTBALL_TEAM_ID,
      season,
      last: 5,
    });

    const fixtures = Array.isArray(fixturesPayload.response) ? fixturesPayload.response : [];

    for (const fixture of fixtures) {
      const fixtureId = fixture?.fixture?.id;
      if (!fixtureId) {
        continue;
      }

      try {
        const lineupPayload = await getApiFootball('/fixtures/lineups', {
          fixture: fixtureId,
        });

        const lineups = Array.isArray(lineupPayload.response) ? lineupPayload.response : [];
        const barcaLineup = lineups.find((entry) => entry?.team?.id === BARCA_API_FOOTBALL_TEAM_ID);

        if (barcaLineup) {
          return normalizeLineupResponse(fixture, barcaLineup);
        }
      } catch (error) {
        continue;
      }
    }

    return {
      fixtureId: null,
      fixtureDate: null,
      opponent: null,
      formation: '4-3-3',
      coach: 'Unavailable',
      team: 'FC Barcelona',
      startXI: [],
      bench: [],
    };
  });
}

async function getUpcomingFixtures() {
  return cachedJson('fixtures', CACHE_TTL.fixtures, async () => {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const currentYear = today.getUTCFullYear();
    const seasonEndYear = today.getUTCMonth() >= 6 ? currentYear + 1 : currentYear;
    const seasonEndIso = `${seasonEndYear}-06-30`;
    const response = await getFootballData(`/teams/${BARCA_FOOTBALL_DATA_TEAM_ID}/matches`, {
      dateFrom: todayIso,
      dateTo: seasonEndIso,
    });

    const matches = Array.isArray(response.matches) ? response.matches : [];

    const upcoming = matches
      .filter((match) => match.status === 'SCHEDULED' || match.status === 'TIMED')
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
      .slice(0, 8)
      .map((match) => ({
        id: match.id,
        opponent:
          match.homeTeam?.id === BARCA_FOOTBALL_DATA_TEAM_ID
            ? match.awayTeam?.name
            : match.homeTeam?.name,
        competition: match.competition?.name || 'Competition',
        competitionCode: match.competition?.code || '',
        utcDate: match.utcDate,
        matchday: match.matchday ?? null,
        venue: match.homeTeam?.id === BARCA_FOOTBALL_DATA_TEAM_ID ? 'Home' : 'Away',
        homeTeam: match.homeTeam?.name || '',
        awayTeam: match.awayTeam?.name || '',
      }));

    return {
      team: {
        id: BARCA_FOOTBALL_DATA_TEAM_ID,
        name: 'FC Barcelona',
      },
      fixtures: upcoming,
    };
  });
}

app.get('/news', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const data = await getNewsData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching news', error: err.message });
  }
});

app.get('/api/players', async (req, res) => {
  try {
    const data = await getApiFootballPlayers();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching player data',
      error: err.message,
    });
  }
});

app.get('/api/lineup', async (req, res) => {
  try {
    const data = await getLatestLineup();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching lineup data',
      error: err.message,
    });
  }
});

app.get('/api/fixtures', async (req, res) => {
  try {
    const data = await getUpcomingFixtures();
    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: 'Error fetching fixtures',
      error: err.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
