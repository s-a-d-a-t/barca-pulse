const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: '/home/sadat/Documents/barca-pulse/.env' });

const config = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: 'gemini-3.5-flash',
};

const OUTPUT_PATH = path.join(__dirname, '../data/players_preset.json');

// High-quality hardcoded fallback preset
const fallbackPreset = [
  {
    "id": 1496,
    "name": "Raphinha",
    "photo": "https://media.api-sports.io/football/players/1496.png",
    "age": 29,
    "nationality": "Brazil",
    "position": "Attacker",
    "shirtNumber": 11,
    "appearances": 54,
    "goals": 32,
    "assists": 18,
    "minutesPlayed": 4317,
    "yellowCards": 6,
    "redCards": 0,
    "rating": 7.9,
    "status": "captain",
    "stats": { "starts": 51, "substitutes": 3, "rating": 7.9 }
  },
  {
    "id": 521,
    "name": "Robert Lewandowski",
    "photo": "https://media.api-sports.io/football/players/521.png",
    "age": 37,
    "nationality": "Poland",
    "position": "Attacker",
    "shirtNumber": 9,
    "appearances": 47,
    "goals": 35,
    "assists": 10,
    "minutesPlayed": 3820,
    "yellowCards": 4,
    "redCards": 0,
    "rating": 7.8,
    "status": "active",
    "stats": { "starts": 44, "substitutes": 3, "rating": 7.8 }
  },
  {
    "id": 1500,
    "name": "Lamine Yamal",
    "photo": "https://media.api-sports.io/football/players/1500.png",
    "age": 18,
    "nationality": "Spain",
    "position": "Attacker",
    "shirtNumber": 19,
    "appearances": 50,
    "goals": 15,
    "assists": 16,
    "minutesPlayed": 3650,
    "yellowCards": 2,
    "redCards": 0,
    "rating": 8.1,
    "status": "active",
    "stats": { "starts": 42, "substitutes": 8, "rating": 8.1 }
  },
  {
    "id": 152,
    "name": "Pedri",
    "photo": "https://media.api-sports.io/football/players/152.png",
    "age": 23,
    "nationality": "Spain",
    "position": "Midfielder",
    "shirtNumber": 8,
    "appearances": 45,
    "goals": 8,
    "assists": 12,
    "minutesPlayed": 3200,
    "yellowCards": 3,
    "redCards": 0,
    "rating": 7.75,
    "status": "active",
    "stats": { "starts": 38, "substitutes": 7, "rating": 7.75 }
  },
  {
    "id": 2283,
    "name": "Dani Olmo",
    "photo": "https://media.api-sports.io/football/players/2283.png",
    "age": 27,
    "nationality": "Spain",
    "position": "Midfielder",
    "shirtNumber": 20,
    "appearances": 32,
    "goals": 12,
    "assists": 8,
    "minutesPlayed": 2100,
    "yellowCards": 2,
    "redCards": 0,
    "rating": 7.6,
    "status": "new",
    "stats": { "starts": 24, "substitutes": 8, "rating": 7.6 }
  },
  {
    "id": 154,
    "name": "Gavi",
    "photo": "https://media.api-sports.io/football/players/154.png",
    "age": 21,
    "nationality": "Spain",
    "position": "Midfielder",
    "shirtNumber": 6,
    "appearances": 18,
    "goals": 2,
    "assists": 3,
    "minutesPlayed": 850,
    "yellowCards": 5,
    "redCards": 0,
    "rating": 7.2,
    "status": "active",
    "stats": { "starts": 8, "substitutes": 10, "rating": 7.2 }
  },
  {
    "id": 178,
    "name": "Frenkie de Jong",
    "photo": "https://media.api-sports.io/football/players/178.png",
    "age": 28,
    "nationality": "Netherlands",
    "position": "Midfielder",
    "shirtNumber": 21,
    "appearances": 30,
    "goals": 3,
    "assists": 5,
    "minutesPlayed": 2200,
    "yellowCards": 4,
    "redCards": 0,
    "rating": 7.4,
    "status": "active",
    "stats": { "starts": 26, "substitutes": 4, "rating": 7.4 }
  },
  {
    "id": 1883,
    "name": "Marc Casadó",
    "photo": "https://media.api-sports.io/football/players/1883.png",
    "age": 22,
    "nationality": "Spain",
    "position": "Midfielder",
    "shirtNumber": 17,
    "appearances": 42,
    "goals": 1,
    "assists": 8,
    "minutesPlayed": 3150,
    "yellowCards": 7,
    "redCards": 0,
    "rating": 7.5,
    "status": "active",
    "stats": { "starts": 35, "substitutes": 7, "rating": 7.5 }
  },
  {
    "id": 156,
    "name": "Fermín López",
    "photo": "https://media.api-sports.io/football/players/156.png",
    "age": 22,
    "nationality": "Spain",
    "position": "Midfielder",
    "shirtNumber": 16,
    "appearances": 38,
    "goals": 9,
    "assists": 6,
    "minutesPlayed": 1950,
    "yellowCards": 3,
    "redCards": 0,
    "rating": 7.3,
    "status": "active",
    "stats": { "starts": 18, "substitutes": 20, "rating": 7.3 }
  },
  {
    "id": 114,
    "name": "Jules Koundé",
    "photo": "https://media.api-sports.io/football/players/114.png",
    "age": 27,
    "nationality": "France",
    "position": "Defender",
    "shirtNumber": 23,
    "appearances": 48,
    "goals": 2,
    "assists": 6,
    "minutesPlayed": 4120,
    "yellowCards": 4,
    "redCards": 0,
    "rating": 7.6,
    "status": "active",
    "stats": { "starts": 46, "substitutes": 2, "rating": 7.6 }
  },
  {
    "id": 1502,
    "name": "Pau Cubarsí",
    "photo": "https://media.api-sports.io/football/players/1502.png",
    "age": 19,
    "nationality": "Spain",
    "position": "Defender",
    "shirtNumber": 2,
    "appearances": 44,
    "goals": 0,
    "assists": 2,
    "minutesPlayed": 3700,
    "yellowCards": 5,
    "redCards": 0,
    "rating": 7.45,
    "status": "active",
    "stats": { "starts": 41, "substitutes": 3, "rating": 7.45 }
  },
  {
    "id": 140,
    "name": "Iñigo Martínez",
    "photo": "https://media.api-sports.io/football/players/140.png",
    "age": 34,
    "nationality": "Spain",
    "position": "Defender",
    "shirtNumber": 5,
    "appearances": 40,
    "goals": 3,
    "assists": 1,
    "minutesPlayed": 3400,
    "yellowCards": 9,
    "redCards": 1,
    "rating": 7.35,
    "status": "active",
    "stats": { "starts": 38, "substitutes": 2, "rating": 7.35 }
  },
  {
    "id": 142,
    "name": "Alejandro Balde",
    "photo": "https://media.api-sports.io/football/players/142.png",
    "age": 22,
    "nationality": "Spain",
    "position": "Defender",
    "shirtNumber": 3,
    "appearances": 43,
    "goals": 2,
    "assists": 5,
    "minutesPlayed": 3320,
    "yellowCards": 3,
    "redCards": 0,
    "rating": 7.4,
    "status": "active",
    "stats": { "starts": 37, "substitutes": 6, "rating": 7.4 }
  },
  {
    "id": 112,
    "name": "Ronald Araujo",
    "photo": "https://media.api-sports.io/football/players/112.png",
    "age": 26,
    "nationality": "Uruguay",
    "position": "Defender",
    "shirtNumber": 4,
    "appearances": 20,
    "goals": 1,
    "assists": 1,
    "minutesPlayed": 1600,
    "yellowCards": 4,
    "redCards": 1,
    "rating": 7.3,
    "status": "active",
    "stats": { "starts": 18, "substitutes": 2, "rating": 7.3 }
  },
  {
    "id": 110,
    "name": "Marc-André ter Stegen",
    "photo": "https://media.api-sports.io/football/players/110.png",
    "age": 33,
    "nationality": "Germany",
    "position": "Goalkeeper",
    "shirtNumber": 1,
    "appearances": 15,
    "goals": 0,
    "assists": 0,
    "minutesPlayed": 1350,
    "yellowCards": 1,
    "redCards": 0,
    "rating": 7.2,
    "status": "injured",
    "stats": { "starts": 15, "substitutes": 0, "rating": 7.2 }
  },
  {
    "id": 1506,
    "name": "Iñaki Peña",
    "photo": "https://media.api-sports.io/football/players/1506.png",
    "age": 26,
    "nationality": "Spain",
    "position": "Goalkeeper",
    "shirtNumber": 13,
    "appearances": 35,
    "goals": 0,
    "assists": 0,
    "minutesPlayed": 3150,
    "yellowCards": 2,
    "redCards": 0,
    "rating": 7.1,
    "status": "active",
    "stats": { "starts": 35, "substitutes": 0, "rating": 7.1 }
  },
  {
    "id": 146,
    "name": "Andreas Christensen",
    "photo": "https://media.api-sports.io/football/players/146.png",
    "age": 29,
    "nationality": "Denmark",
    "position": "Defender",
    "shirtNumber": 15,
    "appearances": 25,
    "goals": 1,
    "assists": 2,
    "minutesPlayed": 1700,
    "yellowCards": 3,
    "redCards": 0,
    "rating": 7.25,
    "status": "active",
    "stats": { "starts": 17, "substitutes": 8, "rating": 7.25 }
  },
  {
    "id": 150,
    "name": "Ferran Torres",
    "photo": "https://media.api-sports.io/football/players/150.png",
    "age": 25,
    "nationality": "Spain",
    "position": "Attacker",
    "shirtNumber": 7,
    "appearances": 36,
    "goals": 8,
    "assists": 4,
    "minutesPlayed": 1800,
    "yellowCards": 2,
    "redCards": 0,
    "rating": 7.2,
    "status": "active",
    "stats": { "starts": 16, "substitutes": 20, "rating": 7.2 }
  },
  {
    "id": 1505,
    "name": "Pau Víctor",
    "photo": "https://media.api-sports.io/football/players/1505.png",
    "age": 24,
    "nationality": "Spain",
    "position": "Attacker",
    "shirtNumber": 18,
    "appearances": 28,
    "goals": 5,
    "assists": 3,
    "minutesPlayed": 1100,
    "yellowCards": 1,
    "redCards": 0,
    "rating": 7.1,
    "status": "new",
    "stats": { "starts": 8, "substitutes": 20, "rating": 7.1 }
  },
  {
    "id": 148,
    "name": "Ansu Fati",
    "photo": "https://media.api-sports.io/football/players/148.png",
    "age": 23,
    "nationality": "Spain",
    "position": "Attacker",
    "shirtNumber": 10,
    "appearances": 22,
    "goals": 4,
    "assists": 2,
    "minutesPlayed": 980,
    "yellowCards": 1,
    "redCards": 0,
    "rating": 7.1,
    "status": "active",
    "stats": { "starts": 7, "substitutes": 15, "rating": 7.1 }
  },
  {
    "id": 180,
    "name": "Eric García",
    "photo": "https://media.api-sports.io/football/players/180.png",
    "age": 25,
    "nationality": "Spain",
    "position": "Defender",
    "shirtNumber": 24,
    "appearances": 26,
    "goals": 0,
    "assists": 1,
    "minutesPlayed": 1450,
    "yellowCards": 4,
    "redCards": 1,
    "rating": 7.15,
    "status": "active",
    "stats": { "starts": 14, "substitutes": 12, "rating": 7.15 }
  },
  {
    "id": 1890,
    "name": "Marc Bernal",
    "photo": "https://media.api-sports.io/football/players/1890.png",
    "age": 18,
    "nationality": "Spain",
    "position": "Midfielder",
    "shirtNumber": 28,
    "appearances": 8,
    "goals": 0,
    "assists": 1,
    "minutesPlayed": 600,
    "yellowCards": 1,
    "redCards": 0,
    "rating": 7.3,
    "status": "injured",
    "stats": { "starts": 7, "substitutes": 1, "rating": 7.3 }
  },
  {
    "id": 1892,
    "name": "Héctor Fort",
    "photo": "https://media.api-sports.io/football/players/1892.png",
    "age": 19,
    "nationality": "Spain",
    "position": "Defender",
    "shirtNumber": 32,
    "appearances": 18,
    "goals": 0,
    "assists": 2,
    "minutesPlayed": 950,
    "yellowCards": 2,
    "redCards": 0,
    "rating": 7.1,
    "status": "active",
    "stats": { "starts": 9, "substitutes": 9, "rating": 7.1 }
  },
  {
    "id": 1894,
    "name": "Gerard Martín",
    "photo": "https://media.api-sports.io/football/players/1894.png",
    "age": 23,
    "nationality": "Spain",
    "position": "Defender",
    "shirtNumber": 35,
    "appearances": 20,
    "goals": 0,
    "assists": 1,
    "minutesPlayed": 1100,
    "yellowCards": 3,
    "redCards": 0,
    "rating": 7.05,
    "status": "active",
    "stats": { "starts": 10, "substitutes": 10, "rating": 7.05 }
  }
];

function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return;
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
}

async function run() {
  ensureDirectoryExistence(OUTPUT_PATH);
  
  if (!config.GEMINI_API_KEY) {
    console.warn("No GEMINI_API_KEY found, writing fallback preset.");
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(fallbackPreset, null, 2), 'utf-8');
    return;
  }

  try {
    console.log("Calling Gemini to generate Barcelona players squad and stats...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;
    
    const prompt = 
      "Generate a valid JSON array of current (2025/2026 season) FC Barcelona first-team players. " +
      "Include at least 24 players. For each player, include these exact fields:\n" +
      "- id: a unique number\n" +
      "- name: full name (e.g. Marc-André ter Stegen, Lamine Yamal, Raphinha, Robert Lewandowski)\n" +
      "- photo: photo URL (use https://media.api-sports.io/football/players/{id}.png with real player ID or fallback)\n" +
      "- age: current age (e.g. Yamal 18, Pedri 23, Gavi 21, Raphinha 29, Lewandowski 37)\n" +
      "- nationality: e.g. Spain, Brazil, Poland, Germany, Uruguay, France, Netherlands\n" +
      "- position: EXACTLY one of 'Goalkeeper', 'Defender', 'Midfielder', or 'Attacker'\n" +
      "- shirtNumber: number\n" +
      "- appearances: total appearances in the current 2025/2026 season (e.g. Raphinha 54, Lewandowski 47, Yamal 50)\n" +
      "- goals: total goals in the current 2025/2026 season (e.g. Lewandowski 35, Raphinha 32, Yamal 15)\n" +
      "- assists: total assists in the current 2025/2026 season (e.g. Raphinha 18, Yamal 16)\n" +
      "- minutesPlayed: number of minutes played in the current 2025/2026 season\n" +
      "- yellowCards: number of yellow cards in 2025/2026\n" +
      "- redCards: number of red cards in 2025/2026\n" +
      "- rating: average match rating in the current 2025/2026 season (e.g. Yamal 8.10, Raphinha 7.90, Lewandowski 7.80)\n" +
      "- status: EXACTLY one of 'active', 'injured', 'captain', or 'new'\n" +
      "- stats: object with starts (number), substitutes (number), and rating (number)\n\n" +
      "Ensure you return ONLY a raw JSON array block. Do not include markdown code block syntax (like ```json), explanations, or text surrounding the JSON.";

    const response = await axios.post(url, {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    }, { timeout: 30000 });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    // Parse to verify it is valid JSON
    const parsed = JSON.parse(text.trim());
    if (Array.isArray(parsed) && parsed.length > 0) {
      console.log(`Successfully generated ${parsed.length} players using Gemini!`);
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    } else {
      throw new Error("Response was not a non-empty array");
    }

  } catch (err) {
    console.error("Failed to generate players using Gemini, writing fallback preset. Error:", err.message);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(fallbackPreset, null, 2), 'utf-8');
  }
}

run();
