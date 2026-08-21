const cache = new Map();

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

function setCache(key, data, ttlMs) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  });
}

function getCacheEntry(key) {
  return cache.get(key) || null;
}

function getCacheData(key) {
  const entry = cache.get(key);
  return entry ? entry.data : null;
}

module.exports = {
  cachedJson,
  setCache,
  getCacheEntry,
  getCacheData
};
