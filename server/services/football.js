const axios = require('axios');
const config = require('../config');
const cache = require('../cache');

// Core Constants
const LINEUP_CACHE_KEY = 'lineup';

// Internal Helper Functions
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

function normalizeApiFootballPlayer(squadPlayer, playerEntry = null, season = null) {
  const stats = Array.isArray(playerEntry?.statistics) && playerEntry.statistics.length > 0
    ? playerEntry.statistics[0]
    : {};
  const games = stats.games || {};
  const goals = stats.goals || {};
  const cards = stats.cards || {};
  const passes = stats.passes || {};

  return {
    id: squadPlayer.id,
    name: squadPlayer.name || playerEntry?.player?.name || 'Unknown Player',
    photo:
      squadPlayer.photo ||
      playerEntry?.player?.photo ||
      `https://media.api-sports.io/football/players/${squadPlayer.id}.png`,
    age:
      squadPlayer.age ??
      calculateAge(squadPlayer.birth?.date || squadPlayer.birthdate || squadPlayer.dateOfBirth || playerEntry?.player?.birth?.date),
    nationality: squadPlayer.nationality || playerEntry?.player?.nationality || 'Unknown',
    position: squadPlayer.position || playerEntry?.player?.position || 'Unknown',
    shirtNumber: squadPlayer.number ?? squadPlayer.shirtNumber ?? playerEntry?.player?.number ?? null,
    appearances: games.appearences ?? games.appearances ?? 0,
    goals: goals.total ?? 0,
    assists: passes.assists ?? 0,
    minutesPlayed: games.minutes ?? 0,
    yellowCards: cards.yellow ?? 0,
    redCards: cards.red ?? 0,
    rating: stats.games?.rating ? Number.parseFloat(stats.games.rating) : null,
    season,
    stats: {
      starts: games.lineups ?? 0,
      substitutes: games.substitutes ?? 0,
      rating: stats.games?.rating ? Number.parseFloat(stats.games.rating) : null,
    },
  };
}

function formatUtcDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function getSeasonStartIso() {
  return `${getCurrentSeasonStartYear()}-07-01`;
}

async function getApiFootball(pathname, params = {}) {
  const response = await axios.get(`${config.API_FOOTBALL_BASE_URL}${pathname}`, {
    params,
    headers: {
      'x-apisports-key': config.API_FOOTBALL_KEY,
    },
    timeout: 20000,
  });

  return response.data;
}

async function getFootballData(pathname, params = {}) {
  const response = await axios.get(`${config.FOOTBALL_DATA_BASE_URL}${pathname}`, {
    params,
    headers: {
      'X-Auth-Token': config.FOOTBALL_DATA_API_KEY,
    },
    timeout: 20000,
  });

  return response.data;
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

function getFixtureKickoffDate(fixture) {
  const rawDate = fixture?.fixture?.date || fixture?.fixture?.utcDate || null;
  if (!rawDate) {
    return null;
  }

  const kickoffDate = new Date(rawDate);
  return Number.isNaN(kickoffDate.getTime()) ? null : kickoffDate;
}

function getFixtureStatusShort(fixture) {
  return String(fixture?.fixture?.status?.short || fixture?.status?.short || fixture?.status || '').toUpperCase();
}

function isBarcaApiFootballTeam(teamId) {
  return Number(teamId) === config.BARCA_API_FOOTBALL_TEAM_ID;
}

function normalizeLineupResponse(fixture, lineupEntry) {
  return {
    fixtureId: fixture?.fixture?.id || null,
    fixtureDate: fixture?.fixture?.date || fixture?.fixture?.utcDate || null,
    fixtureStatus: getFixtureStatusShort(fixture) || null,
    opponent:
      isBarcaApiFootballTeam(fixture?.teams?.home?.id)
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

function getEmptyLineup() {
  return {
    fixtureId: null,
    fixtureDate: null,
    fixtureStatus: 'TBD',
    opponent: 'Pending',
    formation: '4-3-3',
    coach: 'Hansi Flick',
    team: 'FC Barcelona',
    startXI: [
      { id: 1, name: 'M. ter Stegen', number: 1, position: 'G', grid: { row: 1, column: 1 } },
      { id: 2, name: 'J. Koundé', number: 23, position: 'D', grid: { row: 2, column: 4 } },
      { id: 3, name: 'P. Cubarsí', number: 2, position: 'D', grid: { row: 2, column: 3 } },
      { id: 4, name: 'I. Martínez', number: 5, position: 'D', grid: { row: 2, column: 2 } },
      { id: 5, name: 'A. Balde', number: 3, position: 'D', grid: { row: 2, column: 1 } },
      { id: 6, name: 'F. de Jong', number: 21, position: 'M', grid: { row: 3, column: 3 } },
      { id: 7, name: 'Pedri', number: 8, position: 'M', grid: { row: 3, column: 2 } },
      { id: 8, name: 'M. Casadó', number: 17, position: 'M', grid: { row: 3, column: 1 } },
      { id: 9, name: 'Lamine Yamal', number: 19, position: 'F', grid: { row: 4, column: 3 } },
      { id: 10, name: 'R. Lewandowski', number: 9, position: 'F', grid: { row: 4, column: 2 } },
      { id: 11, name: 'Raphinha', number: 11, position: 'F', grid: { row: 4, column: 1 } }
    ],
    bench: [
      { id: 12, name: 'I. Peña', number: 13, position: 'G' },
      { id: 13, name: 'Gavi', number: 6, position: 'M' },
      { id: 14, name: 'Dani Olmo', number: 20, position: 'M' },
      { id: 15, name: 'F. Torres', number: 7, position: 'F' },
      { id: 16, name: 'R. Araujo', number: 4, position: 'D' },
      { id: 17, name: 'Fermín', number: 16, position: 'M' }
    ],
  };
}

function isRateLimitError(error) {
  return Boolean(error?.response && error.response.status === 429);
}

function normalizeFootballDataMatch(match) {
  return {
    id: match?.id ?? null,
    opponent:
      match?.homeTeam?.id === config.BARCA_FOOTBALL_DATA_TEAM_ID
        ? match?.awayTeam?.name
        : match?.homeTeam?.name,
    competition: match?.competition?.name || 'Competition',
    competitionCode: match?.competition?.code || '',
    utcDate: match?.utcDate || null,
    matchday: match?.matchday ?? null,
    venue: match?.homeTeam?.id === config.BARCA_FOOTBALL_DATA_TEAM_ID ? 'Home' : 'Away',
    homeTeam: match?.homeTeam?.name || '',
    awayTeam: match?.awayTeam?.name || '',
    status: match?.status || '',
  };
}

async function getFootballDataMatches(cacheKey, params) {
  return cache.cachedJson(cacheKey, 15 * 60 * 1000, async () => {
    const response = await getFootballData(`/teams/${config.BARCA_FOOTBALL_DATA_TEAM_ID}/matches`, params);
    return Array.isArray(response.matches) ? response.matches : [];
  });
}

async function getLatestCompletedMatch() {
  const matches = await getFootballDataMatches('fd-recent-finished-matches', {
    dateFrom: getSeasonStartIso(),
    dateTo: formatUtcDateOnly(new Date()),
    status: 'FINISHED',
    limit: 5,
  });

  const finished = matches
    .filter((match) => match.status === 'FINISHED')
    .sort((a, b) => new Date(b.utcDate) - new Date(a.utcDate));

  return finished.length > 0 ? normalizeFootballDataMatch(finished[0]) : null;
}

async function getNextUpcomingMatch() {
  const matches = await getFootballDataMatches('fd-upcoming-matches', {
    dateFrom: formatUtcDateOnly(new Date()),
    dateTo: `${getCurrentSeasonStartYear() + 1}-06-30`,
  });

  const upcoming = matches
    .filter((match) => match.status === 'SCHEDULED' || match.status === 'TIMED')
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

  return upcoming.length > 0 ? normalizeFootballDataMatch(upcoming[0]) : null;
}

async function findApiFootballFixtureForMatch(match) {
  if (!match?.utcDate) {
    return null;
  }

  const targetDate = formatUtcDateOnly(new Date(match.utcDate));
  let fixturePayload = await getApiFootball('/fixtures', {
    team: config.BARCA_API_FOOTBALL_TEAM_ID,
    date: targetDate,
    season: getCurrentSeasonStartYear(),
  });

  let fixtures = Array.isArray(fixturePayload.response) ? fixturePayload.response : [];
  
  if (!fixtures.length) {
    const matchTime = new Date(match.utcDate).getTime();
    const dayBefore = formatUtcDateOnly(new Date(matchTime - 86400000));
    fixturePayload = await getApiFootball('/fixtures', {
      team: config.BARCA_API_FOOTBALL_TEAM_ID,
      date: dayBefore,
      season: getCurrentSeasonStartYear(),
    });
    fixtures = Array.isArray(fixturePayload.response) ? fixturePayload.response : [];
    
    if (!fixtures.length) {
      const dayAfter = formatUtcDateOnly(new Date(matchTime + 86400000));
      fixturePayload = await getApiFootball('/fixtures', {
        team: config.BARCA_API_FOOTBALL_TEAM_ID,
        date: dayAfter,
        season: getCurrentSeasonStartYear(),
      });
      fixtures = Array.isArray(fixturePayload.response) ? fixturePayload.response : [];
    }
  }

  if (!fixtures.length) {
    return null;
  }

  const targetTimestamp = new Date(match.utcDate).getTime();
  return fixtures
    .filter((fixture) => fixture?.fixture?.id)
    .sort((a, b) => {
      const aDiff = Math.abs((getFixtureKickoffDate(a)?.getTime() || 0) - targetTimestamp);
      const bDiff = Math.abs((getFixtureKickoffDate(b)?.getTime() || 0) - targetTimestamp);
      return aDiff - bDiff;
    })[0] || null;
}

async function fetchLineupForFixture(fixture) {
  const fixtureId = fixture?.fixture?.id;
  if (!fixtureId) {
    return null;
  }

  const cacheKey = `lineup:${fixtureId}`;
  const cached = cache.getCacheEntry(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  try {
    const lineupPayload = await getApiFootball('/fixtures/lineups', {
      fixture: fixtureId,
    });

    const lineups = Array.isArray(lineupPayload.response) ? lineupPayload.response : [];
    const barcaLineup = lineups.find((entry) => isBarcaApiFootballTeam(entry?.team?.id));

    if (!barcaLineup) {
      return cached?.data || null;
    }

    const normalized = normalizeLineupResponse(fixture, barcaLineup);
    cache.setCache(cacheKey, normalized, config.CACHE_TTL.lineupFixture);
    return normalized;
  } catch (error) {
    if (isRateLimitError(error) && cached?.data) {
      return cached.data;
    }

    return cached?.data || null;
  }
}

async function fetchLineupForMatch(match) {
  const apiFootballFixture = await findApiFootballFixtureForMatch(match);
  if (!apiFootballFixture) {
    return null;
  }

  const lineup = await fetchLineupForFixture(apiFootballFixture);
  if (!lineup) {
    return null;
  }

  return {
    ...lineup,
    fixtureDate: match.utcDate || lineup.fixtureDate,
    opponent: match.opponent || lineup.opponent,
  };
}

// Public API Functions
async function getApiFootballPlayers() {
  return cache.cachedJson('players', config.CACHE_TTL.players, async () => {
    const season = getCurrentSeasonStartYear();
    const squadPayload = await getApiFootball('/players/squads', {
      team: config.BARCA_API_FOOTBALL_TEAM_ID,
    });

    const squadPlayers = Array.isArray(squadPayload.response?.[0]?.players)
      ? squadPayload.response[0].players
      : [];

    const normalizedPlayers = [];

    for (const squadPlayer of squadPlayers) {
      let playerEntry = null;
      let usedSeason = season;

      try {
        const playerPayload = await getApiFootball('/players', { id: squadPlayer.id, season });
        const currentSeasonEntry = Array.isArray(playerPayload.response) ? playerPayload.response[0] : null;
        const currentGames = currentSeasonEntry?.statistics?.[0]?.games || {};
        const hasUsefulStats = Boolean(
          (currentGames.appearences ?? currentGames.appearances ?? 0) > 0 ||
          (currentSeasonEntry?.statistics?.[0]?.goals?.total ?? 0) > 0 ||
          (currentSeasonEntry?.statistics?.[0]?.cards?.yellow ?? 0) > 0 ||
          (currentSeasonEntry?.statistics?.[0]?.cards?.red ?? 0) > 0
        );

        if (hasUsefulStats) {
          playerEntry = currentSeasonEntry;
        } else {
          const fallbackPayload = await getApiFootball('/players', { id: squadPlayer.id, season: season - 1 });
          const fallbackEntry = Array.isArray(fallbackPayload.response) ? fallbackPayload.response[0] : null;
          const fallbackGames = fallbackEntry?.statistics?.[0]?.games || {};
          const fallbackHasStats = Boolean(
            (fallbackGames.appearences ?? fallbackGames.appearances ?? 0) > 0 ||
            (fallbackEntry?.statistics?.[0]?.goals?.total ?? 0) > 0 ||
            (fallbackEntry?.statistics?.[0]?.cards?.yellow ?? 0) > 0 ||
            (fallbackEntry?.statistics?.[0]?.cards?.red ?? 0) > 0
          );

          if (fallbackHasStats) {
            playerEntry = fallbackEntry;
            usedSeason = season - 1;
          } else {
            playerEntry = currentSeasonEntry;
          }
        }
      } catch (error) {
        playerEntry = null;
      }

      normalizedPlayers.push(normalizeApiFootballPlayer(squadPlayer, playerEntry, usedSeason));
    }

    normalizedPlayers.sort((a, b) => {
      const aNumber = Number.isFinite(a.shirtNumber) ? a.shirtNumber : 999;
      const bNumber = Number.isFinite(b.shirtNumber) ? b.shirtNumber : 999;
      return aNumber - bNumber;
    });

    return {
      season,
      team: {
        id: config.BARCA_API_FOOTBALL_TEAM_ID,
        name: 'FC Barcelona',
      },
      players: normalizedPlayers,
    };
  });
}

async function getPlayerDetails(playerId) {
  const season = getCurrentSeasonStartYear();
  const seasonsToTry = [season, season - 1];

  for (const year of seasonsToTry) {
    try {
      const payload = await getApiFootball('/players', {
        id: playerId,
        season: year,
      });

      const entry = Array.isArray(payload.response) ? payload.response[0] : null;
      if (!entry) {
        continue;
      }

      const stats = entry.statistics?.[0] || {};
      const games = stats.games || {};
      const goals = stats.goals || {};
      const cards = stats.cards || {};
      const passes = stats.passes || {};

      const hasUsefulStats = Boolean(
        (games.appearences ?? games.appearances ?? 0) > 0 ||
        (goals.total ?? 0) > 0 ||
        (cards.yellow ?? 0) > 0 ||
        (cards.red ?? 0) > 0 ||
        (passes.assists ?? 0) > 0
      );

      if (!hasUsefulStats && year !== seasonsToTry[seasonsToTry.length - 1]) {
        continue;
      }

      return normalizeApiFootballPlayer(entry.player || { id: playerId }, entry, year);
    } catch (error) {
      continue;
    }
  }

  return null;
}

async function getLatestLineup() {
  const cached = cache.getCacheEntry(LINEUP_CACHE_KEY);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return cached.data;
  }

  let data;

  try {
    const [recentMatch, upcomingMatch] = await Promise.all([
      getLatestCompletedMatch(),
      getNextUpcomingMatch(),
    ]);

    if (upcomingMatch) {
      const kickoffDate = new Date(upcomingMatch.utcDate);
      const minutesUntilKickoff = (kickoffDate.getTime() - now) / (60 * 1000);

      if (minutesUntilKickoff <= 30) {
        const upcomingLineup = await fetchLineupForMatch(upcomingMatch);
        if (upcomingLineup && upcomingLineup.startXI && upcomingLineup.startXI.length > 0) {
          data = {
            ...upcomingLineup,
            lineupType: 'upcoming',
          };
        }
      }
    }

    if (!data && recentMatch) {
      const recentLineup = await fetchLineupForMatch(recentMatch);
      if (recentLineup && recentLineup.startXI && recentLineup.startXI.length > 0) {
        data = {
          ...recentLineup,
          lineupType: 'recent',
        };
      }
    }

    if (!data) {
      data = {
        ...getEmptyLineup(),
        lineupType: 'fallback',
      };
    }
  } catch (error) {
    if (cached?.data && cached.data.startXI?.length > 0) {
      return cached.data;
    }

    return {
      ...getEmptyLineup(),
      lineupType: 'fallback',
      error: isRateLimitError(error) ? 'rate_limited' : 'unavailable',
    };
  }

  if (data.startXI.length > 0) {
    cache.setCache(LINEUP_CACHE_KEY, data, config.CACHE_TTL.lineup);
  } else if (cached?.data && cached.data.startXI?.length > 0) {
    return cached.data;
  }

  return data;
}

async function getUpcomingFixtures() {
  return cache.cachedJson('fixtures', config.CACHE_TTL.fixtures, async () => {
    const today = new Date();
    const todayIso = today.toISOString().slice(0, 10);
    const currentYear = today.getUTCFullYear();
    const seasonEndYear = today.getUTCMonth() >= 6 ? currentYear + 1 : currentYear;
    const seasonEndIso = `${seasonEndYear}-06-30`;
    const response = await getFootballData(`/teams/${config.BARCA_FOOTBALL_DATA_TEAM_ID}/matches`, {
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
          match.homeTeam?.id === config.BARCA_FOOTBALL_DATA_TEAM_ID
            ? match.awayTeam?.name
            : match.homeTeam?.name,
        opponentCrest:
          match.homeTeam?.id === config.BARCA_FOOTBALL_DATA_TEAM_ID
            ? match.awayTeam?.crest
            : match.homeTeam?.crest,
        barcaCrest:
          match.homeTeam?.id === config.BARCA_FOOTBALL_DATA_TEAM_ID
            ? match.homeTeam?.crest
            : match.awayTeam?.crest,
        competition: match.competition?.name || 'Competition',
        competitionCode: match.competition?.code || '',
        utcDate: match.utcDate,
        matchday: match.matchday ?? null,
        venue: match.homeTeam?.id === config.BARCA_FOOTBALL_DATA_TEAM_ID ? 'Home' : 'Away',
        homeTeam: match.homeTeam?.name || '',
        awayTeam: match.awayTeam?.name || '',
        homeCrest: match.homeTeam?.crest || '',
        awayCrest: match.awayTeam?.crest || '',
      }));

    return {
      team: {
        id: config.BARCA_FOOTBALL_DATA_TEAM_ID,
        name: 'FC Barcelona',
      },
      fixtures: upcoming,
    };
  });
}

module.exports = {
  getApiFootballPlayers,
  getPlayerDetails,
  getLatestLineup,
  getUpcomingFixtures
};
