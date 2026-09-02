const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const OUTPUT_PATH = path.join(__dirname, '../data/players_preset.json');
const API_FOOTBALL_KEY = process.env.API_FOOTBALL_KEY;

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

async function run() {
  ensureDirectoryExistence(OUTPUT_PATH);

  if (!API_FOOTBALL_KEY) {
    console.warn("API_FOOTBALL_KEY is missing in .env. Cannot fetch live squad.");
    return;
  }

  console.log("Fetching current FC Barcelona squad directly from API-Football squads endpoint...");

  try {
    const res = await axios.get('https://v3.football.api-sports.io/players/squads?team=529', {
      headers: { 'x-apisports-key': API_FOOTBALL_KEY },
      timeout: 15000
    });

    const rawSquad = res.data.response?.[0]?.players || [];

    const squadList = rawSquad.map(p => ({
      id: p.id,
      name: p.name,
      photo: p.photo || `https://media.api-sports.io/football/players/${p.id}.png`,
      age: p.age || null,
      position: p.position || 'Unknown',
      shirtNumber: p.number ?? null
    }));

    if (squadList.length > 0) {
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(squadList, null, 2), 'utf-8');
      console.log(`Successfully saved ${squadList.length} current squad players directly from API-Football!`);
    } else {
      console.error("No players returned by API-Football.");
    }
  } catch (err) {
    console.error("Error fetching squad from API-Football:", err.message);
  }
}

run();
