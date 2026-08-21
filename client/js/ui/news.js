import { DOM } from '../config.js';

export function renderNews(articles) {
    const container = DOM.newsContainer;
    if (!container) return;

    container.innerHTML = '';

    if (!articles || articles.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500">No relevant Barça news found. Check back later!</p>';
        return;
    }

    articles.forEach((article) => {
        const date = new Date(article.publishedAt);
        const formattedDate = date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        const card = document.createElement('div');
        card.className = 'news-card fade-in';
        card.innerHTML = `
            <div class="news-image-container">
                <div class="news-date-badge">${formattedDate}</div>
                <div class="news-source-tag">${article.source?.name || 'Source'}</div>
                <img src="${article.urlToImage || 'https://placehold.co/600x400/002855/ffffff?text=Barça+News'}"
                     alt="${article.title}"
                     onerror="this.onerror=null;this.src='https://placehold.co/600x400/002855/ffffff?text=Barça+News';">
                <div class="news-image-overlay"></div>
            </div>
            <div class="news-content">
                <h3 class="news-title line-clamp-2">${article.title}</h3>
                <p class="news-description line-clamp-3">${article.description || 'Visit our website for the full story on this latest Barça development.'}</p>
                <div class="news-footer">
                    <a href="${article.url}" target="_blank" class="read-more-btn">
                        Explore Story <i class="fas fa-arrow-right"></i>
                    </a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}
