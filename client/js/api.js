import { BACKEND_URL } from './config.js';

export async function getNews() {
    const response = await fetch(`${BACKEND_URL}/news?t=${Date.now()}`);
    if (!response.ok) throw new Error('News API request failed');
    const newsData = await response.json();
    if (!newsData.articles || newsData.articles.length === 0) {
        return [];
    }

    const barcaNews = newsData.articles.filter((article) => {
        const title = (article.title || '').toLowerCase();
        const description = (article.description || '').toLowerCase();
        const content = (article.content || '').toLowerCase();

        const keywords = [
            'barcelona',
            'barca',
            'barça',
            'fcb',
            'blaugrana',
            'camp nou',
            'hansi flick',
            'lamine yamal',
            'lewandowski',
            'pedri',
            'gavi',
        ];

        return keywords.some((kw) => title.includes(kw) || description.includes(kw) || content.includes(kw));
    });

    return barcaNews.sort(() => 0.5 - Math.random()).slice(0, 6);
}

export async function getPlayers() {
    const response = await fetch(`${BACKEND_URL}/api/players`);
    if (!response.ok) throw new Error('Player API request failed');
    const data = await response.json();
    return Array.isArray(data.players) ? data.players : [];
}

export async function getPlayerDetails(playerId) {
    const response = await fetch(`${BACKEND_URL}/api/players/${playerId}`);
    if (!response.ok) throw new Error('Player details request failed');
    const data = await response.json();
    return data.player || null;
}

export async function getLineup() {
    const response = await fetch(`${BACKEND_URL}/api/lineup?t=${Date.now()}`);
    if (!response.ok) throw new Error('Lineup API request failed');
    return await response.json();
}

export async function getFixtures() {
    const response = await fetch(`${BACKEND_URL}/api/fixtures`);
    if (!response.ok) throw new Error('Fixtures API request failed');
    const data = await response.json();
    return Array.isArray(data.fixtures) ? data.fixtures : [];
}
