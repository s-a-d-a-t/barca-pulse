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

// Search vector database for top K matches
async function searchVectorStore(queryText, topK = 4) {
  const store = loadVectorStore();
  if (!store || store.length === 0) {
    return [];
  }

  try {
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
  } catch (error) {
    console.error('Error searching vector store:', error.message);
    return [];
  }
}

// Clear internal cache (useful after re-indexing)
function clearCache() {
  vectorCache = null;
}

// Core RAG query function
async function queryRAG(userMessage, messageHistory = []) {
  if (!config.GEMINI_API_KEY) {
    return {
      text: "I'd love to help, but the **GEMINI_API_KEY** is missing from the server's `.env` configuration. Please obtain a free key from Google AI Studio and add it to proceed!",
      sources: []
    };
  }

  try {
    // 1. Search local vector database for matching context
    const localMatches = await searchVectorStore(userMessage, 4);
    
    // Format retrieved contexts
    let localContextText = "";
    if (localMatches.length > 0) {
      localContextText = localMatches
        .map((m, idx) => `[Context ${idx + 1} - ${m.type}]: ${m.text}`)
        .join("\n\n");
    } else {
      localContextText = "No direct local database records found matching this query.";
    }

    // 2. Build system instructions and context-based prompt
    const systemInstruction = config.ENABLE_SEARCH_GROUNDING
      ? "You are BarcaBot, a helpful, enthusiastic, and knowledgeable FC Barcelona AI Assistant integrated into the BarçaPulse fan portal. " +
        "You have access to real-time local website data (players, news, fixtures, history) and the Google Search tool for external questions. " +
        "When answering, follow these guidelines:\n" +
        "1. Be friendly, authentic, and showcase passion for Barcelona (use words like 'Visca el Barça!', 'Blaugrana', etc.).\n" +
        "2. Prioritize using the provided Local Context if it is relevant. If the local data is insufficient or you need more facts, use Google Search Grounding to find up-to-date information.\n" +
        "3. Format your answers in markdown. Keep it engaging and concise.\n" +
        "4. Cite sources if Google Search grounding provides them.\n" +
        "5. Avoid answering questions completely unrelated to football or FC Barcelona. Politely steer the conversation back to Barça."
      : "You are BarcaBot, a helpful, enthusiastic, and knowledgeable FC Barcelona AI Assistant integrated into the BarçaPulse fan portal. " +
        "You have access to real-time local website data (players, news, fixtures, history).\n" +
        "When answering, follow these guidelines:\n" +
        "1. Be friendly, authentic, and showcase passion for Barcelona (use words like 'Visca el Barça!', 'Blaugrana', etc.).\n" +
        "2. Prioritize using the provided Local Context if it is relevant. If the local data is insufficient or you need more facts, use your general knowledge of FC Barcelona, but be honest if you don't know the answer or lack real-time/recent details.\n" +
        "3. Format your answers in markdown. Keep it engaging and concise.\n" +
        "4. Avoid answering questions completely unrelated to football or FC Barcelona. Politely steer the conversation back to Barça.";

    const contextPrompt = config.ENABLE_SEARCH_GROUNDING
      ? `Local Website Context:\n` +
        `========================\n` +
        `${localContextText}\n` +
        `========================\n\n` +
        `User Question: ${userMessage}\n\n` +
        `Instructions: Answer the question by combining the local context above and Google Search grounding if needed.`
      : `Local Website Context:\n` +
        `========================\n` +
        `${localContextText}\n` +
        `========================\n\n` +
        `User Question: ${userMessage}\n\n` +
        `Instructions: Answer the question using the local context above or your general knowledge.`;

    // 3. Format message contents for Gemini REST API
    // Convert history to Gemini format (role: user/model, parts: [{text: ...}])
    const contents = [];
    
    // Add past history if any
    messageHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    });

    // Add latest user query with context
    contents.push({
      role: 'user',
      parts: [{ text: contextPrompt }]
    });

    // 4. Send request to gemini-2.5-flash with Google Search Grounding enabled
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.GEMINI_MODELS.chat}:generateContent?key=${config.GEMINI_API_KEY}`;
    
    const requestData = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2048
      }
    };

    if (config.ENABLE_SEARCH_GROUNDING) {
      requestData.tools = [
        {
          googleSearch: {}
        }
      ];
    }

    let response;
    let usedSearchGrounding = config.ENABLE_SEARCH_GROUNDING;

    try {
      response = await axios.post(url, requestData, { timeout: 25000 });
    } catch (error) {
      if (usedSearchGrounding) {
        console.warn('Gemini Search Grounding failed, retrying without search grounding. Error:', error.response?.data || error.message);
        
        const fallbackSystemInstruction = 
          "You are BarcaBot, a helpful, enthusiastic, and knowledgeable FC Barcelona AI Assistant integrated into the BarçaPulse fan portal. " +
          "You have access to real-time local website data (players, news, fixtures, history).\n" +
          "When answering, follow these guidelines:\n" +
          "1. Be friendly, authentic, and showcase passion for Barcelona (use words like 'Visca el Barça!', 'Blaugrana', etc.).\n" +
          "2. Prioritize using the provided Local Context if it is relevant. If the local data is insufficient or you need more facts, use your general knowledge of FC Barcelona, but be honest if you don't know the answer or lack real-time/recent details.\n" +
          "3. Format your answers in markdown. Keep it engaging and concise.\n" +
          "4. Avoid answering questions completely unrelated to football or FC Barcelona. Politely steer the conversation back to Barça.";

        const fallbackContextPrompt = 
          `Local Website Context:\n` +
          `========================\n` +
          `${localContextText}\n` +
          `========================\n\n` +
          `User Question: ${userMessage}\n\n` +
          `Instructions: Answer the question using the local context above or your general knowledge.`;

        const fallbackContents = [...contents];
        if (fallbackContents.length > 0) {
          fallbackContents[fallbackContents.length - 1] = {
            role: 'user',
            parts: [{ text: fallbackContextPrompt }]
          };
        }

        const fallbackRequestData = {
          contents: fallbackContents,
          systemInstruction: {
            parts: [{ text: fallbackSystemInstruction }]
          },
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048
          }
        };

        response = await axios.post(url, fallbackRequestData, { timeout: 25000 });
        usedSearchGrounding = false;
      } else {
        throw error;
      }
    }
    
    const candidate = response.data?.candidates?.[0];
    const textAnswer = candidate?.content?.parts?.[0]?.text || "I'm sorry, I couldn't generate an answer right now.";
    
    // Extract grounding metadata (search citations)
    const sources = [];
    const groundingMetadata = candidate?.groundingMetadata;
    
    if (groundingMetadata && groundingMetadata.groundingChunks) {
      groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web && chunk.web.uri) {
          sources.push({
            title: chunk.web.title || 'Web Search Source',
            url: chunk.web.uri
          });
        }
      });
    }

    // Include local data sources in citation if they had high similarity (> 0.5)
    localMatches.forEach(match => {
      if (match.similarity > 0.5) {
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
      text: textAnswer,
      sources: uniqueSources.slice(0, 5) // Limit to top 5 sources
    };

  } catch (error) {
    console.error('Error during RAG query:', error.response?.data || error.message);
    return {
      text: `Apologies, I encountered an error while communicating with my brain cells. Details: ${error.message}`,
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
