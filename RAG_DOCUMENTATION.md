# BarçaPulse AI Assistant (BarcaBot) Architecture

This document explains the architecture, design principles, and setup for the **BarcaBot AI Assistant** in BarçaPulse.

---

## 1. System Overview

**BarcaBot** is an intelligent AI assistant dedicated exclusively to FC Barcelona supporters. 

Previously, the application utilized a vector database and embedding-based RAG pipeline. This has been replaced with a **Direct Real-Time Context Grounding & Strict Boundary** architecture.

### Why Direct Grounding Instead of Vector RAG?
- **Zero Embedding Overhead**: No need to generate embeddings, maintain vector databases, or run batch indexing jobs.
- **Always Up-to-Date**: Instead of chunking and caching stale text embeddings, the bot pulls live squad data, upcoming fixtures, and club news directly from internal API services on demand.
- **Strict Anti-Hallucination**: By grounding the LLM directly with verified club facts, current squad members, and fixtures, the model does not guess or hallucinate.
- **Strict Domain Boundary**: The model is locked to FC Barcelona topics only. Questions unrelated to Barça are politely declined.

---

## 2. Guardrails & Anti-Hallucination Measures

1. **Strict Barça Boundary**:
   - The bot will only discuss FC Barcelona (matches, squad, coaches, tactics, history, trophies, Camp Nou, and verified news).
   - Any query outside FC Barcelona (other clubs, other sports, math, coding, politics, or general chit-chat) is politely declined with a Barça-themed redirect.

2. **Grounding Source of Truth**:
   - Current Season: **2025/2026**
   - Head Coach: **Hansi Flick**
   - Live Squad: Fed directly from API-Football. Former players (e.g., Messi, Busquets, Alba, Romeu) are recognized as club legends but strictly excluded from the active squad.
   - If a specific fact or detail is unverified or unknown, the model is strictly instructed to state that verified details are not available rather than making up answers.

3. **Deterministic Generation**:
   - Model: `nvidia/nemotron-3.5-bolt-e4b`
   - Temperature: Lowered to `0.3` for factual accuracy and reduced randomness.

---

## 3. Setup & Configuration

Add your NVIDIA API key to your `.env` file in the project root:

```bash
NEWS_API_KEY=your_newsapi_key
FOOTBALL_DATA_API_KEY=your_football_data_key
API_FOOTBALL_KEY=your_api_football_key
NVIDIA_API_KEY=your_nvidia_api_key
```

### Endpoints
- `POST /api/chat` (and legacy alias `POST /api/rag/query`):
  - Request Body: `{ "message": "Who is the head coach?", "history": [] }`
  - Response: `{ "text": "Hansi Flick is the Head Coach...", "sources": [] }`
