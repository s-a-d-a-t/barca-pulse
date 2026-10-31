const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const STORE_PATH = path.join(__dirname, '../data/vector_store.json');
let vectorCache = null;

// Helper to calculate cosine similarity
function dotProduct(vecA, vecB) {
  let product = 0;
  for (let i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function magnitude(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(vecA, vecB) / (magA * magB);
}

// Generate embedding for text using text-embedding-004
async function generateEmbedding(text) {
  if (!config.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is missing from environment. Add it to your .env file.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODELS.embedding}:embedContent?key=${config.GEMINI_API_KEY}`;
  
  const response = await axios.post(
    url,
    {
      model: `models/${config.GEMINI_MODELS.embedding}`,
      content: {
        parts: [{ text }]
      }
    },
    { timeout: 15000 }
  );

  if (response.data && response.data.embedding && response.data.embedding.values) {
    return response.data.embedding.values;
  }
  throw new Error('Failed to retrieve embedding values from Gemini API.');
}

// Load vector database from disk/cache
function loadVectorStore() {
  if (vectorCache) return vectorCache;

  try {
    if (fs.existsSync(STORE_PATH)) {
      const fileData = fs.readFileSync(STORE_PATH, 'utf-8');
      vectorCache = JSON.parse(fileData);
      return vectorCache;
    }
  } catch (error) {
    console.error('Error loading vector store:', error);
  }
  return [];
}

// Fallback keyword search for local vector store when embedding API is not available
function keywordSearch(store, queryText, topK = 4) {
  if (!store || store.length === 0 || !queryText) return [];
  const words = queryText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(w => w.length > 2);
  if (words.length === 0) return [];

  const results = store.map(doc => {
    const textLower = (doc.text || '').toLowerCase();
    let matches = 0;
    words.forEach(word => {
      if (textLower.includes(word)) {
        matches++;
      }
    });
    return {
      id: doc.id,
      type: doc.type,
      text: doc.text,
      similarity: matches / words.length
    };
  });

  results.sort((a, b) => b.similarity - a.similarity);
  return results.filter(r => r.similarity > 0.1).slice(0, topK);
}

// Search vector database for top K matches
async function searchVectorStore(queryText, topK = 4) {
  const store = loadVectorStore();
  if (!store || store.length === 0) {
    return [];
  }

  try {
    if (config.GEMINI_API_KEY) {
      const queryEmbedding = await generateEmbedding(queryText);
      const results = store.map(doc => {
        const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
        return {
          id: doc.id,
          type: doc.type,
          text: doc.text,
          similarity
        };
      });

      // Sort by similarity descending
      results.sort((a, b) => b.similarity - a.similarity);
      
      // Return items above a reasonable similarity threshold
      return results.filter(r => r.similarity > 0.35).slice(0, topK);
    }
  } catch (error) {
    console.warn('Vector embedding search failed, falling back to keyword search:', error.message);
  }

  // Graceful fallback to keyword search if embedding API is not available
  return keywordSearch(store, queryText, topK);
}

// Clear internal cache (useful after re-indexing)
function clearCache() {
  vectorCache = null;
}

const footballService = require('./football');
const newsService = require('./news');

async function getRealTimeSystemContext() {
  try {
    const playersPayload = await footballService.getApiFootballPlayers();
    const players = playersPayload.players || [];
    const squadSummary = players.length > 0 
      ? players.map(p => `#${p.shirtNumber || 'N/A'} ${p.name} (${p.position})`).join(', ')
      : 'Squad list unavailable.';

    let fixturesSummary = 'Fixtures unavailable.';
    try {
      const fixturesData = await footballService.getUpcomingFixtures();
      const fixtures = fixturesData.fixtures || [];
      if (fixtures.length > 0) {
        fixturesSummary = fixtures.slice(0, 5).map(f => `${f.homeTeam} vs ${f.awayTeam} (${f.utcDate || 'TBD'})`).join('\n');
      }
    } catch(e) {
      console.warn('Fixtures fetch warning for RAG context:', e.message);
    }

    let newsSummary = 'News unavailable.';
    try {
      const newsData = await newsService.getNewsData();
      const articles = newsData.articles || [];
      if (articles.length > 0) {
        newsSummary = articles.slice(0, 3).map(n => `- ${n.title}: ${n.description || n.content || ''}`).join('\n');
      }
    } catch(e) {
      console.warn('News fetch warning for RAG context:', e.message);
    }

    return `REAL-TIME LIVE BARÇA PULSE DATA (Source of Truth):
==================================================
Active Barcelona Squad (${players.length} Players):
${squadSummary}

Upcoming Matches:
${fixturesSummary}

Latest Official Club News:
${newsSummary}
==================================================`;
  } catch (err) {
    console.error('Error constructing real-time system context:', err.message);
    return '';
  }
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

// Call NVIDIA Chat Completions API (supports both streaming and non-streaming)
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
    temperature: config.NVIDIA_TEMPERATURE,
    top_p: config.NVIDIA_TOP_P,
    max_tokens: config.NVIDIA_MAX_TOKENS,
    seed: config.NVIDIA_SEED,
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
        buffer = lines.pop(); // Retain incomplete line

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

// Core RAG query function
async function queryRAG(userMessage, messageHistory = []) {
  if (!config.NVIDIA_API_KEY) {
    return {
      text: "I'd love to help, but the **NVIDIA_API_KEY** is missing from the server's `.env` configuration. Please obtain an API key from [NVIDIA Build](https://build.nvidia.com/) and add it to your `.env` file to proceed!",
      sources: []
    };
  }

  try {
    // 1. Fetch real-time live data and search local vector database
    const realTimeLiveContext = await getRealTimeSystemContext();
    const localMatches = await searchVectorStore(userMessage, 4);
    
    // Format retrieved vector contexts
    let localContextText = "";
    if (localMatches.length > 0) {
      localContextText = localMatches
        .map((m, idx) => `[Vector Context ${idx + 1} - ${m.type}]: ${m.text}`)
        .join("\n\n");
    } else {
      localContextText = "No additional vector database records found matching this query.";
    }

    const combinedContext = `${realTimeLiveContext}\n\nLocal Database Context:\n${localContextText}`;

    // 2. Build system instructions and context-based prompt
    const systemInstruction = 
      "You are BarcaBot, a helpful, enthusiastic, and knowledgeable FC Barcelona AI Assistant integrated into the BarçaPulse fan portal.\n" +
      "STRICT RULE: Always use the REAL-TIME LIVE BARÇA PULSE DATA provided below as your primary, absolute source of truth for current players, squad members, fixtures, and news.\n" +
      "Do NOT invent former or missing players (e.g. Oriol Romeu is NOT in the current squad). Rely on the live squad list provided.\n" +
      "Guidelines:\n" +
      "1. Be friendly, authentic, and showcase passion for Barcelona (use terms like 'Visca el Barça!', 'Blaugrana', etc.).\n" +
      "2. Prioritize the provided real-time data and local context above all else.\n" +
      "3. Format your answers in clean markdown. Keep responses concise, clear, and accurate.\n" +
      "4. Avoid answering questions completely unrelated to football or FC Barcelona.";

    const contextPrompt = 
      `${combinedContext}\n\n` +
      `User Question: ${userMessage}\n\n` +
      `Instructions: Answer the user's question using the REAL-TIME LIVE BARÇA PULSE DATA above.`;

    // 3. Format message contents for NVIDIA OpenAI-compatible chat API
    const messages = [
      {
        role: 'system',
        content: systemInstruction
      }
    ];
    
    // Add past history if any
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

    // Add latest user query with context
    messages.push({
      role: 'user',
      content: contextPrompt
    });

    // 4. Send request to NVIDIA Nemotron model
    const textAnswer = await callNvidiaChatCompletion(messages);

    // 5. Build citations from matching local records
    const sources = [];
    localMatches.forEach(match => {
      if (match.similarity > 0.3) {
        sources.push({
          title: `Local BarçaPulse Database (${match.type})`,
          url: `#${match.type === 'news' ? 'news' : match.type === 'players' ? 'players' : 'fixtures'}`
        });
      }
    });

    // Deduplicate sources by URL
    const uniqueSources = [];
    const seenUrls = new Set();
    sources.forEach(src => {
      if (!seenUrls.has(src.url)) {
        seenUrls.add(src.url);
        uniqueSources.push(src);
      }
    });

    return {
      text: textAnswer || "I'm sorry, I couldn't generate an answer right now.",
      sources: uniqueSources.slice(0, 5)
    };

  } catch (error) {
    const errorDetails = error.response?.data?.message || error.response?.data?.error || error.response?.data || error.message;
    console.error('Error during RAG query:', errorDetails);
    return {
      text: `Apologies, I encountered an error while communicating with my brain cells. Details: ${typeof errorDetails === 'object' ? JSON.stringify(errorDetails) : errorDetails}`,
      sources: []
    };
  }
}

module.exports = {
  generateEmbedding,
  searchVectorStore,
  queryRAG,
  clearCache
};
