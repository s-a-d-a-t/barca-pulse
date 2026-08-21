const fs = require('fs');
const path = require('path');
const config = require('../config');
const footballService = require('./football');
const newsService = require('./news');
const ragService = require('./rag');

const STORE_PATH = path.join(__dirname, '../data/vector_store.json');

// Static club legacy information
const STATIC_LEGACY_CHUNKS = [
  {
    id: 'legacy_foundation',
    type: 'legacy',
    text: 'FC Barcelona (Barça) was founded on November 29, 1899, by a group of Swiss, Catalan, German, and English footballers led by Joan Gamper. The club is a symbol of Catalan culture and identity, with the famous motto "Més que un club" (More than a club).'
  },
  {
    id: 'legacy_stadium',
    type: 'legacy',
    text: 'FC Barcelona\'s home stadium is the Spotify Camp Nou (often called Camp Nou), the "Cathedral of Football". Opened in 1957, it is the largest stadium in Europe with a seating capacity of 99,354, and is currently undergoing renovations to upgrade the venue.'
  },
  {
    id: 'legacy_academy',
    type: 'legacy',
    text: 'La Masia is FC Barcelona\'s world-renowned youth academy, known as "The Talent Factory". It has developed legendary world-class talents like Lionel Messi, Xavi Hernandez, Andrés Iniesta, Sergio Busquets, and current superstar Lamine Yamal.'
  },
  {
    id: 'legacy_trophies',
    type: 'legacy',
    text: 'FC Barcelona\'s trophy cabinet includes 28 La Liga Titles, 5 UEFA Champions League (UCL) trophies, 32 Copa del Rey trophies, and 16 Spanish Super Cups (Supercopa de España).'
  },
  {
    id: 'legacy_coaches',
    type: 'legacy',
    text: 'The coaching staff for the 2025/2026 season is led by Hansi Flick (Head Coach), bringing high-intensity football and tactical discipline. He is assisted by Heiko Westermann (Assistant Coach, defensive specialist) and Toni Tapalovic (Goalkeeping Coach).'
  }
];

// Helper to check if data directory exists
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

// Main indexing function
async function indexAllData() {
  if (!config.GEMINI_API_KEY) {
    console.warn('Indexing skipped: GEMINI_API_KEY is missing.');
    return { success: false, message: 'GEMINI_API_KEY is missing' };
  }

  console.log('Starting RAG Indexing...');
  
  // 1. Load existing vector store for embedding cache-reuse
  const existingStoreMap = new Map();
  try {
    if (fs.existsSync(STORE_PATH)) {
      const existingData = JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
      if (Array.isArray(existingData)) {
        existingData.forEach(doc => {
          if (doc.text && doc.embedding) {
            existingStoreMap.set(doc.text, doc.embedding);
          }
        });
      }
    }
  } catch (error) {
    console.warn('Could not read existing vector store for caching:', error.message);
  }

  const rawChunks = [...STATIC_LEGACY_CHUNKS];

  // 2. Fetch and chunk player profiles
  try {
    console.log('Fetching player profiles for indexing...');
    const playerPayload = await footballService.getApiFootballPlayers();
    const players = playerPayload?.players || [];
    
    players.forEach(p => {
      const ratingStr = p.rating ? `Rating: ${p.rating.toFixed(2)}.` : '';
      const text = `Player Profile: ${p.name} (shirt #${p.shirtNumber || 'N/A'}) is a ${p.age}-year-old ${p.position} from ${p.nationality}. ` +
        `In the 2025/2026 season, he has played ${p.appearances} matches (${p.minutesPlayed} minutes), scoring ${p.goals} goals and making ${p.assists} assists. ` +
        `Yellow cards: ${p.yellowCards}, Red cards: ${p.redCards}. ${ratingStr}`;
      
      rawChunks.push({
        id: `player_${p.id}`,
        type: 'players',
        text
      });
    });
    console.log(`Chunked ${players.length} players.`);
  } catch (error) {
    console.error('Error chunking players:', error.message);
  }

  // 3. Fetch and chunk upcoming fixtures
  try {
    console.log('Fetching fixtures for indexing...');
    const fixturesPayload = await footballService.getUpcomingFixtures();
    const fixtures = fixturesPayload?.fixtures || [];

    fixtures.forEach((f, idx) => {
      const dateStr = f.utcDate ? new Date(f.utcDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }) : 'TBD';
      const text = `Upcoming Match ${idx + 1}: FC Barcelona will play against ${f.opponent} (${f.venue}) in the ${f.competition} competition. ` +
        `Match Date: ${dateStr}. Matchday: ${f.matchday || 'N/A'}. Home Team: ${f.homeTeam}, Away Team: ${f.awayTeam}.`;
      
      rawChunks.push({
        id: `fixture_${f.id || idx}`,
        type: 'fixtures',
        text
      });
    });
    console.log(`Chunked ${fixtures.length} fixtures.`);
  } catch (error) {
    console.error('Error chunking fixtures:', error.message);
  }

  // 4. Fetch and chunk latest news
  try {
    console.log('Fetching latest news for indexing...');
    const newsPayload = await newsService.getNewsData();
    const articles = newsPayload?.articles || [];

    // Filter relevant news articles
    const barcaArticles = articles.filter(article => {
      const title = (article.title || '').toLowerCase();
      const description = (article.description || '').toLowerCase();
      const content = (article.content || '').toLowerCase();
      const keywords = ['barcelona', 'barca', 'barça', 'fcb', 'blaugrana', 'camp nou', 'flick', 'yamal', 'lewandowski', 'pedri', 'gavi'];
      return keywords.some(kw => title.includes(kw) || description.includes(kw) || content.includes(kw));
    }).slice(0, 15); // Index top 15 news articles

    barcaArticles.forEach((a, idx) => {
      const dateStr = a.publishedAt ? new Date(a.publishedAt).toLocaleDateString('en-US') : 'Recent';
      const text = `Barça News Article (published ${dateStr}, source: ${a.source?.name || 'Unknown'}): "${a.title}". ` +
        `Summary: ${a.description || a.content || 'Explore the story online.'}`;
      
      rawChunks.push({
        id: `news_${idx}`,
        type: 'news',
        text
      });
    });
    console.log(`Chunked ${barcaArticles.length} news articles.`);
  } catch (error) {
    console.error('Error chunking news:', error.message);
  }

  // 5. Generate or retrieve embeddings for all chunks
  console.log(`Processing embeddings for ${rawChunks.length} total chunks...`);
  const finalStore = [];
  let apiCallsCount = 0;
  let cachedCount = 0;

  for (const chunk of rawChunks) {
    try {
      let embedding = null;

      // Cache hit: If chunk text matches exactly, reuse embedding to avoid rate limits
      if (existingStoreMap.has(chunk.text)) {
        embedding = existingStoreMap.get(chunk.text);
        cachedCount++;
      } else {
        // Slow down slightly to prevent hitting TPM limits
        if (apiCallsCount > 0 && apiCallsCount % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        embedding = await ragService.generateEmbedding(chunk.text);
        apiCallsCount++;
      }

      finalStore.push({
        ...chunk,
        embedding
      });
    } catch (error) {
      console.error(`Failed to embed chunk ${chunk.id}:`, error.message);
      // Skip chunk if embedding fails
    }
  }

  console.log(`Embedding completed. Cached reused: ${cachedCount}. API calls: ${apiCallsCount}.`);

  // 6. Save vectors to disk
  try {
    ensureDirectoryExistence(STORE_PATH);
    fs.writeFileSync(STORE_PATH, JSON.stringify(finalStore, null, 2), 'utf-8');
    
    // Clear RAG cache so next query reads new file
    ragService.clearCache();
    
    console.log(`RAG Database saved to: ${STORE_PATH}`);
    return {
      success: true,
      totalChunks: finalStore.length,
      apiCalls: apiCallsCount,
      cachedReused: cachedCount
    };
  } catch (error) {
    console.error('Error saving vector store:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  indexAllData
};
