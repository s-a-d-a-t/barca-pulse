function getBackendUrl() {
    if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin.startsWith('http')) {
        const { port, hostname } = window.location;

        if (port === '3000' || hostname === '127.0.0.1' && port === '3000' || hostname === 'localhost' && port === '3000') {
            return window.location.origin;
        }
    }

    return 'http://127.0.0.1:3000';
}

const BACKEND_URL = getBackendUrl();

const state = {
    players: [],
    lineup: null,
    fixtures: [],
    activeFilter: 'all',
};

// DOM elements
const playersContainer = document.querySelector('.player-grid');
const playerModal = document.querySelector('.player-modal');
const mobileMenuBtn = document.getElementById('mobile-menu');
const mobileNav = document.getElementById('mobile-nav');
const playerFilters = document.querySelectorAll('.player-filter');
const formationContainer = document.getElementById('formation-container');
const benchContainer = document.getElementById('bench-container');
const fixturesContainer = document.getElementById('fixtures-container');
const lineupFormationLabel = document.getElementById('lineup-formation');
const lineupCoachLabel = document.getElementById('lineup-coach');
const lineupOpponentLabel = document.getElementById('lineup-opponent');
const headCoachPhoto = document.getElementById('head-coach-photo');
const headCoachName = document.getElementById('head-coach-name');
const headCoachRole = document.getElementById('head-coach-role');
const headCoachDescription = document.getElementById('head-coach-description');

function showLoadingState(container, message) {
    if (!container) return;

    container.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-12">
            <div class="spinner"></div>
        </div>
        <p class="col-span-full text-center text-gray-400 -mt-4">${message}</p>
    `;
}

function parseGrid(grid) {
    if (!grid || typeof grid !== 'string' || !grid.includes(':')) {
        return null;
    }

    const [row, column] = grid.split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isNaN(row) || Number.isNaN(column)) {
        return null;
    }

    return { row, column };
}

function parseFormation(formation) {
    const parts = String(formation || '4-3-3')
        .split('-')
        .map((part) => Number.parseInt(part, 10))
        .filter((part) => Number.isFinite(part) && part > 0);

    return parts.length ? parts : [4, 3, 3];
}

function formatNumber(value, fallback = 'N/A') {
    return value === null || value === undefined || value === '' ? fallback : value;
}

function formatRating(value) {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }

    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric.toFixed(2) : 'N/A';
}

function setModalLoadingState() {
    document.getElementById('modal-player-apps').textContent = '...';
    document.getElementById('modal-player-goals').textContent = '...';
    document.getElementById('modal-player-assists').textContent = '...';
    document.getElementById('modal-player-apps-display').textContent = '...';
    document.getElementById('modal-player-contribution').textContent = 'Loading stats...';
    document.getElementById('modal-player-gpm').textContent = '...';
    document.getElementById('modal-player-apm').textContent = '...';
    document.getElementById('modal-player-shirt').textContent = '...';
    document.getElementById('modal-player-minutes').textContent = '...';
    document.getElementById('modal-player-yellow').textContent = '...';
    document.getElementById('modal-player-red').textContent = '...';
    document.getElementById('modal-player-rating').textContent = '...';
}

function applyPlayerToModal(player) {
    document.getElementById('modal-player-img').src = player.photo;
    document.getElementById('modal-player-name').textContent = player.name;
    document.getElementById('modal-player-position').textContent = player.position;
    document.getElementById('modal-player-number').textContent = formatNumber(player.shirtNumber, 'N/A');
    document.getElementById('modal-player-nationality').textContent = player.nationality;
    document.getElementById('modal-player-age').textContent = formatNumber(player.age, 'N/A');
    document.getElementById('modal-player-height').textContent = 'N/A';
    document.getElementById('modal-player-weight').textContent = 'N/A';
    document.getElementById('modal-player-foot').textContent = 'N/A';
    document.getElementById('modal-player-apps').textContent = formatNumber(player.appearances, 0);
    document.getElementById('modal-player-goals').textContent = formatNumber(player.goals, 0);
    document.getElementById('modal-player-assists').textContent = formatNumber(player.assists, 0);
    document.getElementById('modal-player-apps-display').textContent = formatNumber(player.appearances, 0);
    document.getElementById('modal-player-contribution').textContent = `${formatNumber(player.goals, 0)} goals + ${formatNumber(player.assists, 0)} assists`;
    document.getElementById('modal-player-gpm').textContent = player.appearances ? (player.goals / player.appearances).toFixed(2) : '0.00';
    document.getElementById('modal-player-apm').textContent = player.appearances ? (player.assists / player.appearances).toFixed(2) : '0.00';
    document.getElementById('modal-player-shirt').textContent = formatNumber(player.shirtNumber, 'N/A');
    document.getElementById('modal-player-minutes').textContent = formatNumber(player.minutesPlayed, 0);
    document.getElementById('modal-player-yellow').textContent = formatNumber(player.yellowCards, 0);
    document.getElementById('modal-player-red').textContent = formatNumber(player.redCards, 0);
    document.getElementById('modal-player-rating').textContent = formatRating(player.rating);

    const statusBadgeContainer = document.getElementById('modal-status-badge');
    if (player.status && player.status !== 'active') {
        const statusConfig = {
            injured: { class: 'status-injured', icon: 'fa-plus-circle', text: 'Injured' },
            new: { class: 'status-new', icon: 'fa-star', text: 'New Signing' },
            captain: { class: 'status-captain', icon: 'fa-crown', text: 'Captain' },
            'on-loan': { class: 'status-on-loan', icon: 'fa-exchange-alt', text: 'On Loan' },
        };

        const config = statusConfig[player.status];
        if (config) {
            statusBadgeContainer.innerHTML = `
                <div class="status-badge ${config.class}">
                    <i class="fas ${config.icon}"></i>
                    <span>${config.text}</span>
                </div>
            `;
        }
    } else {
        statusBadgeContainer.innerHTML = '';
    }

    document.getElementById('modal-player-apps-bar').style.width = `${Math.min(100, (player.appearances / 50) * 100)}%`;
    document.getElementById('modal-player-goals-bar').style.width = `${Math.min(100, (player.goals / 30) * 100)}%`;
    document.getElementById('modal-player-assists-bar').style.width = `${Math.min(100, (player.assists / 20) * 100)}%`;
    document.getElementById('modal-player-gpm-bar').style.width = `${Math.min(100, ((player.goals / Math.max(1, player.appearances)) / 1.5) * 100)}%`;
    document.getElementById('modal-player-apm-bar').style.width = `${Math.min(100, ((player.assists / Math.max(1, player.appearances)) / 1.5) * 100)}%`;
}

function getShirtDisplay(player) {
    const number = formatNumber(player.shirtNumber, 'N/A');
    return number;
}

function getLastName(name) {
    const parts = String(name || '').trim().split(/\s+/);
    return parts.length ? parts[parts.length - 1] : 'Player';
}

function getCoachPlaceholder(name) {
    const coachName = String(name || 'Coach').trim();
    const initials = coachName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('.');

    return `https://placehold.co/250x250/002855/ffffff?text=${encodeURIComponent(initials || 'Coach')}`;
}

function updateFilterButtons(position) {
    playerFilters.forEach((btn) => {
        if (btn.dataset.position === position) {
            btn.classList.remove('hover:bg-white/10', 'text-gray-300', 'hover:text-white');
            btn.classList.add('bg-[#db0030]', 'text-white', 'shadow-lg', 'shadow-red-900/20');
        } else {
            btn.classList.add('hover:bg-white/10', 'text-gray-300', 'hover:text-white');
            btn.classList.remove('bg-[#db0030]', 'text-white', 'shadow-lg', 'shadow-red-900/20');
        }
    });
}

function renderPlayers(playersList) {
    if (!playersContainer) return;

    playersContainer.innerHTML = '';

    if (!playersList.length) {
        playersContainer.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-12">
                Player data is temporarily unavailable.
            </div>
        `;
        return;
    }

    playersList.forEach((player) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card text-center fade-in cursor-pointer group relative';
        playerCard.dataset.id = player.id;

        let statusBadgeHTML = '';
        if (player.status && player.status !== 'active') {
            const statusConfig = {
                injured: { class: 'status-injured', icon: 'fa-plus-circle', text: 'Injured' },
                new: { class: 'status-new', icon: 'fa-star', text: 'New' },
                captain: { class: 'status-captain', icon: 'fa-crown', text: 'Captain' },
                'on-loan': { class: 'status-on-loan', icon: 'fa-exchange-alt', text: 'Loan' },
            };

            const config = statusConfig[player.status];
            if (config) {
                statusBadgeHTML = `
                    <div class="status-badge ${config.class}">
                        <i class="fas ${config.icon}"></i>
                        <span>${config.text}</span>
                    </div>
                `;
            }
        }

        playerCard.innerHTML = `
            ${statusBadgeHTML}
            <div class="p-6 relative z-10">
                <div class="relative mx-auto w-32 h-32 rounded-full overflow-hidden border-4 border-white/20 mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500">
                    <img src="${player.photo}"
                         alt="${player.name}"
                         class="w-full h-full object-cover"
                         onerror="this.onerror=null;this.src='https://placehold.co/250x250/002855/ffffff?text=Player';">
                    <div class="absolute bottom-0 left-0 right-0 player-number-badge text-white text-sm py-1.5 font-bold">#${getShirtDisplay(player)}</div>
                </div>
                <h3 class="font-bold text-lg text-white mb-1">${getLastName(player.name)}</h3>
                <p class="text-gray-400 text-sm uppercase tracking-wider">${player.position}</p>
                <p class="text-[#fdd516] text-xs uppercase tracking-[0.2em] mt-2">Rating ${formatRating(player.rating)}</p>
            </div>
        `;

        playersContainer.appendChild(playerCard);
    });
}

function applyPlayerFilter() {
    const filteredPlayers = state.activeFilter === 'all'
        ? state.players
        : state.players.filter((player) => player.position === state.activeFilter);

    renderPlayers(filteredPlayers);
    updateFilterButtons(state.activeFilter);
}

function renderCoachCard(coachName) {
    if (!headCoachName || !headCoachRole || !headCoachDescription || !headCoachPhoto) {
        return;
    }

    if (!coachName || coachName === 'Unknown Coach' || coachName === 'Unavailable') {
        return;
    }

    headCoachName.textContent = coachName;
    headCoachRole.textContent = 'Head Coach';
    headCoachDescription.textContent = `Latest lineup coach fetched from API-Football for BarçaPulse.`;
    headCoachPhoto.src = getCoachPlaceholder(coachName);
    headCoachPhoto.alt = coachName;
}

function renderLineup(lineup) {
    if (!formationContainer) return;

    formationContainer.innerHTML = '';
    if (benchContainer) benchContainer.innerHTML = '';

    if (!lineup || !Array.isArray(lineup.startXI) || lineup.startXI.length === 0) {
        formationContainer.innerHTML = `
            <div class="absolute inset-0 flex items-center justify-center text-center px-6">
                <div>
                    <p class="text-white font-semibold text-lg mb-2">Lineup data is unavailable right now.</p>
                    <p class="text-gray-300 text-sm">We’ll show the latest API-Football lineup as soon as it becomes available.</p>
                </div>
            </div>
        `;
        if (benchContainer) {
            benchContainer.innerHTML = `
                <div class="col-span-full text-center text-gray-400 py-6">
                    Bench data is unavailable.
                </div>
            `;
        }
        return;
    }

    const formationParts = parseFormation(lineup.formation);
    const starters = lineup.startXI
        .map((entry) => ({
            ...entry,
            grid: entry.grid || parseGrid(entry.gridString || null),
        }))
        .sort((a, b) => {
            const aGrid = a.grid || parseGrid(a.grid);
            const bGrid = b.grid || parseGrid(b.grid);

            if (aGrid && bGrid) {
                if (aGrid.row !== bGrid.row) return aGrid.row - bGrid.row;
                return aGrid.column - bGrid.column;
            }

            if (aGrid) return -1;
            if (bGrid) return 1;
            return 0;
        });

    const goalkeeper = starters.find((player) => /goalkeeper/i.test(player.position)) || starters[0];
    const outfieldPlayers = starters.filter((player) => player.id !== goalkeeper?.id);

    const rowTops = formationParts.length === 4
        ? [73, 57, 40, 18]
        : formationParts.length === 3
            ? [68, 45, 22]
            : formationParts.length === 2
                ? [58, 30]
                : Array.from({ length: formationParts.length }, (_, index) => 78 - (index * 14));

    let cursor = 0;
    formationParts.forEach((count, rowIndex) => {
        const rowPlayers = outfieldPlayers.slice(cursor, cursor + count);
        cursor += count;

        const leftPositions = rowPlayers.length === 1
            ? [50]
            : Array.from({ length: rowPlayers.length }, (_, index) => 18 + ((64 / (rowPlayers.length - 1)) * index));

        rowPlayers.forEach((player, index) => {
            const shirt = document.createElement('div');
            shirt.className = 'player-shirt';
            shirt.style.top = `${rowTops[rowIndex] ?? 50}%`;
            shirt.style.left = `${leftPositions[index]}%`;
            shirt.style.transform = 'translate(-50%, -50%)';

            shirt.innerHTML = `
                <div class="shirt-icon">
                    <div class="shirt-stripes"></div>
                    <div class="shirt-number">${formatNumber(player.number ?? player.shirtNumber, '')}</div>
                </div>
                <div class="player-name-label">${getLastName(player.name)}</div>
            `;

            formationContainer.appendChild(shirt);
        });
    });

    if (goalkeeper) {
        const gk = document.createElement('div');
        gk.className = 'player-shirt';
        gk.style.bottom = '30px';
        gk.style.left = '50%';
        gk.style.transform = 'translateX(-50%)';

        gk.innerHTML = `
            <div class="shirt-icon">
                <div class="shirt-stripes"></div>
                <div class="shirt-number">${formatNumber(goalkeeper.number ?? goalkeeper.shirtNumber, '')}</div>
            </div>
            <div class="player-name-label">${getLastName(goalkeeper.name)}</div>
        `;

        formationContainer.appendChild(gk);
    }

    if (lineupFormationLabel) {
        lineupFormationLabel.textContent = lineup.formation || '4-3-3';
    }
    if (lineupCoachLabel) {
        lineupCoachLabel.textContent = `Coach: ${lineup.coach || 'Unavailable'}`;
    }
    if (lineupOpponentLabel) {
        lineupOpponentLabel.textContent = lineup.opponent
            ? `Latest lineup vs ${lineup.opponent}`
            : 'Latest lineup';
    }

    renderCoachCard(lineup.coach);

    if (benchContainer) {
        if (!Array.isArray(lineup.bench) || lineup.bench.length === 0) {
            benchContainer.innerHTML = `
                <div class="col-span-full text-center text-gray-400 py-6">
                    Bench data is unavailable.
                </div>
            `;
        } else {
            benchContainer.innerHTML = '';
            lineup.bench.forEach((player) => {
                const benchCard = document.createElement('div');
                benchCard.className = 'glass rounded-xl p-3 text-center border border-white/10';
                benchCard.innerHTML = `
                    <div class="text-[#fdd516] text-xs uppercase tracking-[0.2em] mb-2">#${formatNumber(player.number ?? player.shirtNumber, 'N/A')}</div>
                    <div class="text-white font-semibold text-sm leading-tight">${player.name}</div>
                    <div class="text-gray-400 text-xs uppercase tracking-wider mt-1">${player.position || 'Substitute'}</div>
                `;
                benchContainer.appendChild(benchCard);
            });
        }
    }
}

function renderFixtures(fixtures) {
    if (!fixturesContainer) return;

    fixturesContainer.innerHTML = '';

    if (!fixtures.length) {
        fixturesContainer.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-12">
                No upcoming fixtures found right now.
            </div>
        `;
        return;
    }

    fixtures.forEach((fixture) => {
        const date = new Date(fixture.utcDate);
        const formattedDate = date.toLocaleDateString('en-US', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
        });
        const formattedTime = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });

        const card = document.createElement('div');
        card.className = 'news-card fade-in';
        card.innerHTML = `
            <div class="news-image-container">
                <div class="news-date-badge">${formattedDate}</div>
                <div class="news-source-tag">${fixture.venue}</div>
                <img src="https://placehold.co/600x400/002855/ffffff?text=Matchday+${fixture.matchday || 'N/A'}"
                     alt="${fixture.opponent}"
                     onerror="this.onerror=null;this.src='https://placehold.co/600x400/002855/ffffff?text=Fixture';">
                <div class="news-image-overlay"></div>
            </div>
            <div class="news-content">
                <h3 class="news-title line-clamp-2">${fixture.opponent}</h3>
                <p class="news-description line-clamp-3">
                    ${fixture.competition}
                </p>
                <div class="space-y-2 text-sm text-gray-300 mb-4">
                    <div class="flex justify-between gap-4">
                        <span>Date</span>
                        <span class="text-white font-semibold">${formattedDate}</span>
                    </div>
                    <div class="flex justify-between gap-4">
                        <span>Kickoff</span>
                        <span class="text-white font-semibold">${formattedTime}</span>
                    </div>
                    <div class="flex justify-between gap-4">
                        <span>Home/Away</span>
                        <span class="text-white font-semibold">${fixture.venue}</span>
                    </div>
                    <div class="flex justify-between gap-4">
                        <span>Matchday</span>
                        <span class="text-white font-semibold">${fixture.matchday ?? 'N/A'}</span>
                    </div>
                </div>
                <div class="news-footer">
                    <span class="read-more-btn cursor-default">
                        ${fixture.competitionCode || 'Fixture'} <i class="fas fa-calendar-alt"></i>
                    </span>
                </div>
            </div>
        `;
        fixturesContainer.appendChild(card);
    });
}

async function openPlayerModal(playerId) {
    const player = state.players.find((entry) => entry.id == playerId);
    if (!player) return;

    applyPlayerToModal(player);
    playerModal.classList.add('active');

    try {
        const response = await fetch(`${BACKEND_URL}/api/players/${playerId}`);
        if (!response.ok) return;

        const data = await response.json();
        if (data.player) {
            const mergedPlayer = { ...player, ...data.player };
            state.players = state.players.map((entry) => (entry.id == playerId ? mergedPlayer : entry));
            applyPlayerToModal(mergedPlayer);
        }
    } catch (error) {
        console.error('Error loading player details:', error);
    }
}

async function fetchPlayers() {
    showLoadingState(playersContainer, 'Loading player profiles...');

    try {
        const response = await fetch(`${BACKEND_URL}/api/players`);
        if (!response.ok) {
            throw new Error('Player API request failed');
        }

        const data = await response.json();
        state.players = Array.isArray(data.players) ? data.players : [];
        applyPlayerFilter();
    } catch (error) {
        playersContainer.innerHTML = `
            <div class="col-span-full text-center text-red-400 py-12">
                Failed to load player data: ${error.message}
            </div>
        `;
    }
}

async function fetchLineup() {
    if (formationContainer) {
        formationContainer.innerHTML = `
            <div class="absolute inset-0 flex items-center justify-center">
                <div class="spinner"></div>
            </div>
        `;
    }

    if (benchContainer) {
        benchContainer.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-6">
                Loading bench...
            </div>
        `;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/api/lineup`);
        if (!response.ok) {
            throw new Error('Lineup API request failed');
        }

        const data = await response.json();
        state.lineup = data;
        renderLineup(data);
    } catch (error) {
        if (formationContainer) {
            formationContainer.innerHTML = `
                <div class="absolute inset-0 flex items-center justify-center text-center px-6">
                    <div>
                        <p class="text-white font-semibold text-lg mb-2">Unable to load lineup</p>
                        <p class="text-gray-300 text-sm">${error.message}</p>
                    </div>
                </div>
            `;
        }
        if (benchContainer) {
            benchContainer.innerHTML = `
                <div class="col-span-full text-center text-red-400 py-6">
                    Failed to load bench data.
                </div>
            `;
        }
    }
}

async function fetchFixtures() {
    showLoadingState(fixturesContainer, 'Loading fixtures...');

    try {
        const response = await fetch(`${BACKEND_URL}/api/fixtures`);
        if (!response.ok) {
            throw new Error('Fixtures API request failed');
        }

        const data = await response.json();
        state.fixtures = Array.isArray(data.fixtures) ? data.fixtures : [];
        renderFixtures(state.fixtures);
    } catch (error) {
        if (fixturesContainer) {
            fixturesContainer.innerHTML = `
                <div class="col-span-full text-center text-red-400 py-12">
                    Failed to load fixtures: ${error.message}
                </div>
            `;
        }
    }
}

async function fetchNews() {
    const container = document.getElementById('news-container');
    showLoadingState(container, 'Loading Barça news...');

    try {
        const response = await fetch(`${BACKEND_URL}/news?t=${Date.now()}`);
        if (!response.ok) throw new Error('Network response was not ok');
        const newsData = await response.json();

        container.innerHTML = '';

        if (!newsData.articles || newsData.articles.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No recent news found at the moment.</p>';
            return;
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

        const shuffledNews = barcaNews.sort(() => 0.5 - Math.random()).slice(0, 6);

        if (shuffledNews.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No relevant Barça news found. Check back later!</p>';
            return;
        }

        shuffledNews.forEach((article) => {
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
    } catch (error) {
        container.innerHTML = `<p class="text-center text-red-500">Failed to pulse news: ${error.message}</p>`;
        console.error('Error loading news:', error);
    }
}

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
    if (playersContainer) {
        playersContainer.addEventListener('click', (event) => {
            const playerCard = event.target.closest('.player-card');
            if (playerCard) {
                openPlayerModal(playerCard.dataset.id);
            }
        });
    }

    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            playerModal.classList.remove('active');
        });
    }

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('hidden');
        });
    }

    document.querySelectorAll('#mobile-nav a').forEach((link) => {
        link.addEventListener('click', () => {
            mobileNav.classList.add('hidden');
        });
    });

    playerFilters.forEach((filter) => {
        filter.addEventListener('click', () => {
            state.activeFilter = filter.dataset.position;
            applyPlayerFilter();
        });
    });

    const refreshNewsBtn = document.getElementById('refreshNews');
    if (refreshNewsBtn) {
        refreshNewsBtn.addEventListener('click', fetchNews);
    }

    const refreshFixturesBtn = document.getElementById('refreshFixtures');
    if (refreshFixturesBtn) {
        refreshFixturesBtn.addEventListener('click', fetchFixtures);
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            playerModal.classList.remove('active');
        }
    });
}

async function initApp() {
    setupEventListeners();
    setupIntersectionObserver();

    await Promise.allSettled([
        fetchNews(),
        fetchPlayers(),
        fetchLineup(),
        fetchFixtures(),
    ]);
}

document.addEventListener('DOMContentLoaded', initApp);
