function getBackendUrl() {
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) {
        const { port, hostname } = window.location;

        if (port === '3000' || hostname === '127.0.0.1' && port === '3000' || hostname === 'localhost' && port === '3000') {
            return window.location.origin;
        }
    }

    return 'http://127.0.0.1:3000';
}

export const BACKEND_URL = getBackendUrl();

export const state = {
    players: [],
    lineup: null,
    fixtures: [],
    activeFilter: 'all',
};

// DOM selectors
export const DOM = {
    playersContainer: document.querySelector('.player-grid'),
    playerModal: document.querySelector('.player-modal'),
    mobileMenuBtn: document.getElementById('mobile-menu'),
    mobileNav: document.getElementById('mobile-nav'),
    playerFilters: document.querySelectorAll('.player-filter'),
    formationContainer: document.getElementById('formation-container'),
    benchContainer: document.getElementById('bench-container'),
    fixturesContainer: document.getElementById('fixtures-container'),
    lineupFormationLabel: document.getElementById('lineup-formation'),
    lineupSourceBadge: document.getElementById('lineup-source-badge'),
    lineupCoachLabel: document.getElementById('lineup-coach'),
    lineupOpponentLabel: document.getElementById('lineup-opponent'),
    headCoachPhoto: document.getElementById('head-coach-photo'),
    headCoachName: document.getElementById('head-coach-name'),
    headCoachRole: document.getElementById('head-coach-role'),
    headCoachDescription: document.getElementById('head-coach-description'),
    newsContainer: document.getElementById('news-container'),
};
