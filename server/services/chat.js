const axios = require('axios');
const config = require('../config');
const footballService = require('./football');
const newsService = require('./news');

// Verified static club legacy details
const BARCA_LEGACY_FACTS = `
CLUB HERITAGE & FACTS:
- Full Name: Futbol Club Barcelona (FC Barcelona / Barça)
- Founded: November 29, 1899 by Joan Gamper
- Motto: "Més que un club" (More than a club)
- Stadium: Spotify Camp Nou (Cathedral of Football, capacity ~99,354)
- Academy: La Masia (world-renowned youth academy)
- Coaching Staff (2025/2026): Head Coach Hansi Flick, Assistant Coach Heiko Westermann, Goalkeeping Coach Toni Tapalovic
- Major Trophies: 28 La Liga Titles, 5 UEFA Champions Leagues (1992, 2006, 2009, 2011, 2015), 32 Copa del Rey Titles, 16 Supercopa de España, 3 FIFA Club World Cups
- Club Colors: Blaugrana (Deep Blue & Deep Red)
`.trim();

// Build live system context directly from backend data services
async function getBarcaContext() {
  let squadSummary = 'Live squad list unavailable.';
  try {
    const playersPayload = await footballService.getApiFootballPlayers();
    const players = playersPayload?.players || [];
    if (players.length > 0) {
      squadSummary = players
        .map(p => `#${p.shirtNumber || 'N/A'} ${p.name} (${p.position})`)
        .join(', ');
    }
  } catch (err) {
    console.warn('Could not fetch squad for context:', err.message);
  }

  let fixturesSummary = 'Upcoming fixtures unavailable.';
  try {
    const fixturesData = await footballService.getUpcomingFixtures();
    const fixtures = fixturesData?.fixtures || [];
    if (fixtures.length > 0) {
      fixturesSummary = fixtures
        .slice(0, 5)
        .map(f => `${f.homeTeam} vs ${f.awayTeam} (${f.utcDate ? new Date(f.utcDate).toLocaleDateString() : 'TBD'}) [${f.competition || 'La Liga'}]`)
        .join('\n');
    }
  } catch (err) {
    console.warn('Could not fetch fixtures for context:', err.message);
  }

  let newsSummary = 'Latest news unavailable.';
  try {
    const newsData = await newsService.getNewsData();
    const articles = newsData?.articles || [];
    if (articles.length > 0) {
      newsSummary = articles
        .slice(0, 3)
        .map(a => `- ${a.title}: ${a.description || a.content || ''}`)
        .join('\n');
    }
  } catch (err) {
    console.warn('Could not fetch news for context:', err.message);
  }

  return `
${BARCA_LEGACY_FACTS}

CURRENT 2025/2026 VERIFIED SQUAD:
${squadSummary}

UPCOMING MATCHES:
${fixturesSummary}

LATEST CLUB NEWS:
${newsSummary}
`.trim();
}

// Helper to extract clean assistant response from message object or stream
function extractAssistantMessage(content, reasoningContent) {
  let text = content || reasoningContent || '';
  if (typeof text !== 'string') return '';
  
  // If content contains <think>...</think> or <thought>...</thought> tags,
  // extract the final answer after the tag if available.
  const cleaned = text.replace(/<(think|thought)>[\s\S]*?<\/\1>/gi, '').trim();
  if (cleaned.length > 0) {
    return cleaned;
  }
  return text.trim();
}

// Call NVIDIA Chat Completions API
async function callNvidiaChatCompletion(messages) {
  const invokeUrl = config.NVIDIA_INVOKE_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';
  const stream = config.NVIDIA_STREAM;

  const headers = {
    'Authorization': `Bearer ${config.NVIDIA_API_KEY}`,
    'Accept': stream ? 'text/event-stream' : 'application/json',
    'Content-Type': 'application/json'
  };

  const payload = {
    model: config.NVIDIA_MODEL || 'nvidia/nemotron-3.5-bolt-e4b',
    messages,
    temperature: config.NVIDIA_TEMPERATURE !== undefined ? config.NVIDIA_TEMPERATURE : 0.3,
    top_p: config.NVIDIA_TOP_P !== undefined ? config.NVIDIA_TOP_P : 0.9,
    max_tokens: config.NVIDIA_MAX_TOKENS || 1024,
    seed: config.NVIDIA_SEED || 42,
    stream: stream,
    parallel_tool_calls: true,
    chat_template_kwargs: {
      enable_thinking: config.NVIDIA_ENABLE_THINKING
    }
  };

  if (!stream) {
    const response = await axios.post(invokeUrl, payload, {
      headers,
      timeout: 60000
    });

    const choice = response.data?.choices?.[0];
    const message = choice?.message || {};
    return extractAssistantMessage(message.content, message.reasoning_content);
  } else {
    // Process stream response
    const response = await axios.post(invokeUrl, payload, {
      headers,
      responseType: 'stream',
      timeout: 60000
    });

    return new Promise((resolve, reject) => {
      let accumulatedText = '';
      let accumulatedReasoning = '';
      let buffer = '';

      response.data.on('data', chunk => {
        buffer += chunk.toString('utf-8');
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;
          if (trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const delta = json.choices?.[0]?.delta;
              if (delta?.content) {
                accumulatedText += delta.content;
              }
              if (delta?.reasoning_content) {
                accumulatedReasoning += delta.reasoning_content;
              }
            } catch (e) {
              // Ignore partial JSON parse errors
            }
          }
        }
      });

      response.data.on('end', () => {
        const finalAnswer = extractAssistantMessage(accumulatedText, accumulatedReasoning);
        resolve(finalAnswer);
      });

      response.data.on('error', err => {
        reject(err);
      });
    });
  }
}

// Generate Chat Response with strict Barca bounding and anti-hallucination guardrails
async function generateChatResponse(userMessage, messageHistory = []) {
  if (!config.NVIDIA_API_KEY) {
    return {
      text: "I'd love to help, but the **NVIDIA_API_KEY** is missing from the server's `.env` configuration. Please obtain an API key from [NVIDIA Build](https://build.nvidia.com) and add it to `.env` to chat!",
      sources: []
    };
  }

  try {
    const barcaContext = await getBarcaContext();

    const systemInstruction = 
`You are BarcaBot, the official-style AI Assistant for FC Barcelona fans on the BarçaPulse portal.

CRITICAL DIRECTIVES:
1. STRICT BARÇA BOUNDARY (ZERO NON-BARÇA QUESTIONS ALLOWED):
   - You must ONLY answer questions directly related to FC Barcelona (matches, players, coaches, tactics, club history, trophies, Camp Nou, La Masia, fixtures, and verified club news).
   - If the user asks about ANY topic NOT directly related to FC Barcelona (e.g., other clubs, other sports without Barça involvement, politics, general coding, math, recipes, casual off-topic questions, or random trivia), you MUST POLITELY REFUSE.
   - Refusal Template: "I am BarcaBot, exclusively dedicated to FC Barcelona! I can only assist with questions about Barça, our matches, squad, and history. Visca el Barça! 🔵🔴"

2. ZERO-TOLERANCE ANTI-HALLUCINATION RULES:
   - Season: The current season is 2025/2026. The Head Coach is Hansi Flick.
   - Live Squad Grounding: Use the VERIFIED LIVE SQUAD LIST below as your absolute source of truth for active players. Do NOT invent players.
   - Former Players: Former players (such as Lionel Messi, Sergio Busquets, Jordi Alba, Oriol Romeu, Ilkay Gündogan, Neymar) are NOT in the current squad. Only reference them when discussing past club history.
   - Never fabricate or guess: If you do not know a specific fact, date, score, transfer fee, or detail with 100% verified certainty, you MUST state: "I do not have verified information on that detail at this moment." Never fabricate answers or cite rumors as confirmed facts.

3. RESPONSE STYLE:
   - Passionate, authentic Blaugrana spirit (use phrases like "Visca el Barça!").
   - Clear, concise, and structured in clean Markdown.

VERIFIED BARÇA CONTEXT:
==================================================
${barcaContext}
==================================================`;

    const messages = [
      {
        role: 'system',
        content: systemInstruction
      }
    ];

    // Append prior dialogue history (capped to preserve context bounds)
    if (Array.isArray(messageHistory)) {
      messageHistory.forEach(msg => {
        if (msg && msg.content) {
          messages.push({
            role: msg.role === 'assistant' ? 'assistant' : 'user',
            content: msg.content
          });
        }
      });
    }

    // Add current user prompt
    messages.push({
      role: 'user',
      content: userMessage
    });

    const textAnswer = await callNvidiaChatCompletion(messages);

    return {
      text: textAnswer || "I'm sorry, I couldn't generate an answer right now.",
      sources: []
    };

  } catch (error) {
    const errorDetails = error.response?.data?.message || error.response?.data?.error || error.response?.data || error.message;
    console.error('Error during BarcaBot query:', errorDetails);
    return {
      text: `Apologies, I encountered an error: ${typeof errorDetails === 'object' ? JSON.stringify(errorDetails) : errorDetails}`,
      sources: []
    };
  }
}

module.exports = {
  generateChatResponse,
  // Alias for backward compatibility
  queryRAG: generateChatResponse
};

