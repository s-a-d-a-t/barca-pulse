import { DOM, state } from './config.js';
import { showLoadingState } from './utils.js';
import { getNews, getPlayers, getLineup, getFixtures } from './api.js';
import { renderNews } from './ui/news.js';
import { renderPlayers, applyPlayerFilter, openPlayerModal } from './ui/players.js';
import { renderLineup } from './ui/lineup.js';
import { renderFixtures, updateFixtureDeckEffect, smoothScrollTo } from './ui/fixtures.js';
import { initChat } from './ui/chat.js';

function setupIntersectionObserver() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach((el) => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
}

function setupEventListeners() {
    if (DOM.playersContainer) {
        DOM.playersContainer.addEventListener('click', (event) => {
            const playerCard = event.target.closest('.player-card');
            if (playerCard) {
                openPlayerModal(playerCard.dataset.id);
            }
        });
    }

    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            DOM.playerModal.classList.remove('active');
        });
    }

    if (DOM.mobileMenuBtn && DOM.mobileNav) {
        DOM.mobileMenuBtn.addEventListener('click', () => {
            DOM.mobileNav.classList.toggle('hidden');
        });
    }

    document.querySelectorAll('#mobile-nav a').forEach((link) => {
        link.addEventListener('click', () => {
            DOM.mobileNav.classList.add('hidden');
        });
    });

    DOM.playerFilters.forEach((filter) => {
        filter.addEventListener('click', () => {
            state.activeFilter = filter.dataset.position;
            applyPlayerFilter();
        });
    });

    const refreshFixturesBtn = document.getElementById('refreshFixtures');
    if (refreshFixturesBtn) {
        refreshFixturesBtn.addEventListener('click', async () => {
            showLoadingState(DOM.fixturesContainer, 'Loading fixtures...');
            try {
                const fixtures = await getFixtures();
                state.fixtures = fixtures;
                renderFixtures(fixtures);
            } catch (error) {
                DOM.fixturesContainer.innerHTML = `<div class="col-span-full text-center text-red-400 py-12">Failed to load fixtures: ${error.message}</div>`;
            }
        });
    }

    const prevBtn = document.getElementById('fixtures-prev');
    const nextBtn = document.getElementById('fixtures-next');
    if (prevBtn && nextBtn && DOM.fixturesContainer) {
        prevBtn.addEventListener('click', () => {
            const cardWidth = DOM.fixturesContainer.clientWidth || 500;
            const currentIndex = Math.round(DOM.fixturesContainer.scrollLeft / cardWidth);
            const targetIndex = Math.max(0, currentIndex - 1);
            smoothScrollTo(targetIndex * cardWidth);
        });

        nextBtn.addEventListener('click', () => {
            const cardWidth = DOM.fixturesContainer.clientWidth || 500;
            const currentIndex = Math.round(DOM.fixturesContainer.scrollLeft / cardWidth);
            const maxIndex = DOM.fixturesContainer.querySelectorAll('.fixture-card').length - 1;
            const targetIndex = Math.min(maxIndex, currentIndex + 1);
            smoothScrollTo(targetIndex * cardWidth);
        });

        DOM.fixturesContainer.addEventListener('scroll', updateFixtureDeckEffect);
        window.addEventListener('resize', updateFixtureDeckEffect);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            DOM.playerModal.classList.remove('active');
        }
    });
}

async function triggerNewsFetch() {
    showLoadingState(DOM.newsContainer, 'Loading Barça news...');
    try {
        const news = await getNews();
        renderNews(news);
    } catch (error) {
        DOM.newsContainer.innerHTML = `<p class="text-center text-red-500">Failed to pulse news: ${error.message}</p>`;
    }
}

async function triggerPlayersFetch() {
    showLoadingState(DOM.playersContainer, 'Loading player profiles...');
    try {
        const players = await getPlayers();
        state.players = players;
        applyPlayerFilter();
    } catch (error) {
        DOM.playersContainer.innerHTML = `<div class="col-span-full text-center text-red-400 py-12">Failed to load player data: ${error.message}</div>`;
    }
}

async function triggerLineupFetch() {
    if (DOM.formationContainer) {
        DOM.formationContainer.innerHTML = `<div class="absolute inset-0 flex items-center justify-center"><div class="spinner"></div></div>`;
    }
    if (DOM.benchContainer) {
        DOM.benchContainer.innerHTML = `<div class="col-span-full text-center text-gray-400 py-6">Loading bench...</div>`;
    }
    try {
        const lineup = await getLineup();
        state.lineup = lineup;
        renderLineup(lineup);
    } catch (error) {
        if (DOM.formationContainer) {
            DOM.formationContainer.innerHTML = `<div class="absolute inset-0 flex items-center justify-center text-center px-6"><div><p class="text-white font-semibold text-lg mb-2">Unable to load lineup</p><p class="text-gray-300 text-sm">${error.message}</p></div></div>`;
        }
        if (DOM.benchContainer) {
            DOM.benchContainer.innerHTML = `<div class="col-span-full text-center text-red-400 py-6">Failed to load bench data.</div>`;
        }
    }
}

async function triggerFixturesFetch() {
    showLoadingState(DOM.fixturesContainer, 'Loading fixtures...');
    try {
        const fixtures = await getFixtures();
        state.fixtures = fixtures;
        renderFixtures(fixtures);
    } catch (error) {
        DOM.fixturesContainer.innerHTML = `<div class="col-span-full text-center text-red-400 py-12">Failed to load fixtures: ${error.message}</div>`;
    }
}

async function initApp() {
    setupEventListeners();
    setupIntersectionObserver();
    initChat();

    await Promise.allSettled([
        triggerNewsFetch(),
        triggerPlayersFetch(),
        triggerLineupFetch(),
        triggerFixturesFetch(),
    ]);
}

document.addEventListener('DOMContentLoaded', initApp);
