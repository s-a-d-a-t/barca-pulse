
// Player data for 24/25 season with status indicators
const players = [
    {
        id: 1,
        name: "Marc-André ter Stegen",
        position: "Goalkeeper",
        number: 1,
        nationality: "Germany",
        age: 32,
        height: "187 cm",
        weight: "85 kg",
        foot: "Right",
        apps: 285,
        goals: 0,
        assists: 1,
        status: "injured",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 2,
        name: "Iñaki Peña",
        position: "Goalkeeper",
        number: 13,
        nationality: "Spain",
        age: 25,
        height: "184 cm",
        weight: "78 kg",
        foot: "Right",
        apps: 18,
        goals: 0,
        assists: 0,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 3,
        name: "Wojciech Szczęsny",
        position: "Goalkeeper",
        number: 25,
        nationality: "Poland",
        age: 34,
        height: "195 cm",
        weight: "90 kg",
        foot: "Right",
        apps: 8,
        goals: 0,
        assists: 0,
        status: "new",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 4,
        name: "Ronald Araujo",
        position: "Defender",
        number: 4,
        nationality: "Uruguay",
        age: 25,
        height: "188 cm",
        weight: "79 kg",
        foot: "Right",
        apps: 150,
        goals: 10,
        assists: 5,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 5,
        name: "Jules Koundé",
        position: "Defender",
        number: 23,
        nationality: "France",
        age: 26,
        height: "178 cm",
        weight: "70 kg",
        foot: "Right",
        apps: 95,
        goals: 4,
        assists: 6,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 6,
        name: "Pau Cubarsí",
        position: "Defender",
        number: 2,
        nationality: "Spain",
        age: 17,
        height: "184 cm",
        weight: "76 kg",
        foot: "Right",
        apps: 35,
        goals: 1,
        assists: 2,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 7,
        name: "Iñigo Martínez",
        position: "Defender",
        number: 5,
        nationality: "Spain",
        age: 33,
        height: "182 cm",
        weight: "78 kg",
        foot: "Left",
        apps: 42,
        goals: 3,
        assists: 1,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 8,
        name: "Alejandro Balde",
        position: "Defender",
        number: 3,
        nationality: "Spain",
        age: 21,
        height: "175 cm",
        weight: "67 kg",
        foot: "Left",
        apps: 85,
        goals: 2,
        assists: 12,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 9,
        name: "Pedri",
        position: "Midfielder",
        number: 8,
        nationality: "Spain",
        age: 22,
        height: "174 cm",
        weight: "60 kg",
        foot: "Right",
        apps: 19,
        goals: 3,
        assists: 5,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 10,
        name: "Gavi",
        position: "Midfielder",
        number: 6,
        nationality: "Spain",
        age: 20,
        height: "173 cm",
        weight: "68 kg",
        foot: "Right",
        apps: 110,
        goals: 8,
        assists: 14,
        status: "injured",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 11,
        name: "Frenkie de Jong",
        position: "Midfielder",
        number: 21,
        nationality: "Netherlands",
        age: 27,
        height: "180 cm",
        weight: "74 kg",
        foot: "Right",
        apps: 8,
        goals: 0,
        assists: 1,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 12,
        name: "Dani Olmo",
        position: "Midfielder",
        number: 20,
        nationality: "Spain",
        age: 26,
        height: "179 cm",
        weight: "73 kg",
        foot: "Right",
        apps: 15,
        goals: 6,
        assists: 3,
        status: "new",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 13,
        name: "Fermín López",
        position: "Midfielder",
        number: 16,
        nationality: "Spain",
        age: 21,
        height: "176 cm",
        weight: "72 kg",
        foot: "Right",
        apps: 42,
        goals: 11,
        assists: 5,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 14,
        name: "Marc Casadó",
        position: "Midfielder",
        number: 17,
        nationality: "Spain",
        age: 21,
        height: "182 cm",
        weight: "75 kg",
        foot: "Right",
        apps: 18,
        goals: 1,
        assists: 2,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 15,
        name: "Robert Lewandowski",
        position: "Attacker",
        number: 9,
        nationality: "Poland",
        age: 36,
        height: "185 cm",
        weight: "81 kg",
        foot: "Right",
        apps: 22,
        goals: 19,
        assists: 7,
        status: "captain",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 16,
        name: "Lamine Yamal",
        position: "Attacker",
        number: 19,
        nationality: "Spain",
        age: 17,
        height: "178 cm",
        weight: "65 kg",
        foot: "Left",
        apps: 21,
        goals: 7,
        assists: 11,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 17,
        name: "Raphinha",
        position: "Attacker",
        number: 11,
        nationality: "Brazil",
        age: 28,
        height: "176 cm",
        weight: "68 kg",
        foot: "Left",
        apps: 23,
        goals: 14,
        assists: 10,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 18,
        name: "Ferran Torres",
        position: "Attacker",
        number: 7,
        nationality: "Spain",
        age: 24,
        height: "184 cm",
        weight: "77 kg",
        foot: "Right",
        apps: 115,
        goals: 25,
        assists: 15,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 19,
        name: "Ansu Fati",
        position: "Attacker",
        number: 10,
        nationality: "Spain",
        age: 22,
        height: "178 cm",
        weight: "66 kg",
        foot: "Right",
        apps: 112,
        goals: 29,
        assists: 11,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 20,
        name: "Pau Víctor",
        position: "Attacker",
        number: 18,
        nationality: "Spain",
        age: 23,
        height: "180 cm",
        weight: "74 kg",
        foot: "Right",
        apps: 8,
        goals: 3,
        assists: 1,
        status: "new",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 21,
        name: "Eric García",
        position: "Defender",
        number: 24,
        nationality: "Spain",
        age: 24,
        height: "182 cm",
        weight: "73 kg",
        foot: "Right",
        apps: 88,
        goals: 2,
        assists: 3,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 22,
        name: "Héctor Fort",
        position: "Defender",
        number: 32,
        nationality: "Spain",
        age: 18,
        height: "178 cm",
        weight: "70 kg",
        foot: "Right",
        apps: 12,
        goals: 0,
        assists: 1,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 23,
        name: "Pablo Torre",
        position: "Midfielder",
        number: 14,
        nationality: "Spain",
        age: 21,
        height: "172 cm",
        weight: "65 kg",
        foot: "Right",
        apps: 15,
        goals: 2,
        assists: 3,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 24,
        name: "Andreas Christensen",
        position: "Defender",
        number: 15,
        nationality: "Denmark",
        age: 28,
        height: "187 cm",
        weight: "81 kg",
        foot: "Right",
        apps: 78,
        goals: 3,
        assists: 2,
        status: "injured",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 25,
        name: "Gerard Martín",
        position: "Defender",
        number: 35,
        nationality: "Spain",
        age: 22,
        height: "177 cm",
        weight: "72 kg",
        foot: "Left",
        apps: 6,
        goals: 0,
        assists: 0,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    },
    {
        id: 26,
        name: "Sergi Domínguez",
        position: "Defender",
        number: 36,
        nationality: "Spain",
        age: 20,
        height: "185 cm",
        weight: "78 kg",
        foot: "Right",
        apps: 2,
        goals: 0,
        assists: 0,
        status: "active",
        photo: "" // INSERT IMAGE URL HERE
    }
];


// Backend API base URL (still present but not used for news/matches)
const BACKEND_URL = 'http://127.0.0.1:5000';

// DOM elements
const playersContainer = document.querySelector('.player-grid');
const playerModal = document.querySelector('.player-modal');
const mobileMenuBtn = document.getElementById('mobile-menu');
const mobileNav = document.getElementById('mobile-nav');
const playerFilters = document.querySelectorAll('.player-filter');

// Initialize the app
function initApp() {
    renderPlayers(players);
    loadFormation(); // Load formation on page load
    fetchNews(); // ✅ Load Barça news on page load
    setupEventListeners();
    setupIntersectionObserver();

    // ✅ Bind the refresh button
    const refreshBtn = document.getElementById('refreshNews');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', fetchNews);
    }
}

// Render players
function renderPlayers(playersList) {
    playersContainer.innerHTML = '';

    playersList.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card text-center fade-in cursor-pointer group relative';
        playerCard.dataset.id = player.id;

        // Status badge HTML
        let statusBadgeHTML = '';
        if (player.status && player.status !== 'active') {
            const statusConfig = {
                'injured': { class: 'status-injured', icon: 'fa-plus-circle', text: 'Injured' },
                'new': { class: 'status-new', icon: 'fa-star', text: 'New' },
                'captain': { class: 'status-captain', icon: 'fa-crown', text: 'Captain' },
                'on-loan': { class: 'status-on-loan', icon: 'fa-exchange-alt', text: 'Loan' }
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
                    <div class="absolute bottom-0 left-0 right-0 player-number-badge text-white text-sm py-1.5 font-bold">#${player.number}</div>
                </div>
                <h3 class="font-bold text-lg text-white mb-1">${player.name.split(' ').slice(-1)[0]}</h3>
                <p class="text-gray-400 text-sm uppercase tracking-wider">${player.position}</p>
            </div>
        `;
        playersContainer.appendChild(playerCard);
    });
}

// Define the starting XI for the 4-3-3 formation
const startingXI = {
    gk: { id: 2, pos: 'pos-gk' },      // Iñaki Peña
    rb: { id: 5, pos: 'pos-rb' },      // Jules Koundé
    rcb: { id: 4, pos: 'pos-rcb' },    // Ronald Araujo
    lcb: { id: 6, pos: 'pos-lcb' },    // Pau Cubarsí
    lb: { id: 8, pos: 'pos-lb' },      // Alejandro Balde
    dm: { id: 11, pos: 'pos-dm' },     // Frenkie de Jong
    rcm: { id: 9, pos: 'pos-rcm' },    // Pedri
    lcm: { id: 10, pos: 'pos-lcm' },   // Gavi
    rw: { id: 17, pos: 'pos-rw' },     // Lamine Yamal
    st: { id: 13, pos: 'pos-st' },     // Robert Lewandowski
    lw: { id: 16, pos: 'pos-lw' }      // Ansu Fati
};

// Load formation on coaching section
function loadFormation() {
    const formationContainer = document.getElementById('formation-container');
    if (!formationContainer) return;

    formationContainer.innerHTML = '';

    // Populate the formation with starting XI
    Object.values(startingXI).forEach(playerData => {
        const player = players.find(p => p.id === playerData.id);
        if (!player) return;

        const playerShirt = document.createElement('div');
        playerShirt.className = `player-shirt ${playerData.pos}`;

        // Get last name
        const lastName = player.name.split(' ').slice(-1)[0];

        playerShirt.innerHTML = `
            <div class="shirt-icon">
                <div class="shirt-stripes"></div>
                <div class="shirt-number">${player.number}</div>
            </div>
            <div class="player-name-label">${lastName}</div>
        `;

        formationContainer.appendChild(playerShirt);
    });
}

// Open player modal with individual player stats
function openPlayerModal(playerId) {
    const player = players.find(p => p.id == playerId);
    if (!player) return;

    // Populate modal
    document.getElementById('modal-player-img').src = player.photo;
    document.getElementById('modal-player-name').textContent = player.name;
    document.getElementById('modal-player-position').textContent = player.position;
    document.getElementById('modal-player-number').textContent = player.number;
    document.getElementById('modal-player-nationality').textContent = player.nationality;
    document.getElementById('modal-player-age').textContent = player.age;
    document.getElementById('modal-player-height').textContent = player.height;
    document.getElementById('modal-player-weight').textContent = player.weight;
    document.getElementById('modal-player-foot').textContent = player.foot;
    document.getElementById('modal-player-apps').textContent = player.apps;
    document.getElementById('modal-player-goals').textContent = player.goals;
    document.getElementById('modal-player-assists').textContent = player.assists;

    // Display status badge in modal
    const statusBadgeContainer = document.getElementById('modal-status-badge');
    if (player.status && player.status !== 'active') {
        const statusConfig = {
            'injured': { class: 'status-injured', icon: 'fa-plus-circle', text: 'Injured' },
            'new': { class: 'status-new', icon: 'fa-star', text: 'New Signing' },
            'captain': { class: 'status-captain', icon: 'fa-crown', text: 'Captain' },
            'on-loan': { class: 'status-on-loan', icon: 'fa-exchange-alt', text: 'On Loan' }
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

    // Set bar widths (adjust max values as needed for realistic progress bars)
    document.getElementById('modal-player-apps-bar').style.width = `${Math.min(100, (player.apps / 50) * 100)}%`; // Max 50 apps for 100%
    document.getElementById('modal-player-goals-bar').style.width = `${Math.min(100, (player.goals / 30) * 100)}%`; // Max 30 goals for 100%
    document.getElementById('modal-player-assists-bar').style.width = `${Math.min(100, (player.assists / 20) * 100)}%`; // Max 20 assists for 100%

    // Show modal
    playerModal.classList.add('active');
}

// Filter players by position
function filterPlayers(position) {
    if (position === 'all') {
        renderPlayers(players);
    } else {
        const filteredPlayers = players.filter(player => player.position === position);
        renderPlayers(filteredPlayers);
    }

    // Update active filter button
    // Update active filter button
    playerFilters.forEach(btn => {
        if (btn.dataset.position === position) {
            btn.classList.remove('hover:bg-white/10', 'text-gray-300', 'hover:text-white');
            btn.classList.add('bg-[#db0030]', 'text-white', 'shadow-lg', 'shadow-red-900/20');
        } else {
            btn.classList.add('hover:bg-white/10', 'text-gray-300', 'hover:text-white');
            btn.classList.remove('bg-[#db0030]', 'text-white', 'shadow-lg', 'shadow-red-900/20');
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Player card click
    playersContainer.addEventListener('click', (e) => {
        const playerCard = e.target.closest('.player-card');
        if (playerCard) {
            openPlayerModal(playerCard.dataset.id);
        }
    });

    // Close modal
    document.querySelector('.close-modal').addEventListener('click', () => {
        playerModal.classList.remove('active');
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileNav.classList.toggle('hidden');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('#mobile-nav a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.add('hidden');
        });
    });

    // Player filters
    playerFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            filterPlayers(filter.dataset.position);
        });
    });
}

// Setup intersection observer for animations
function setupIntersectionObserver() {
    const fadeElements = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeElements.forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
    });
}
async function fetchNews() {
    const container = document.getElementById('news-container');
    container.innerHTML = `<div class="spinner mx-auto my-4"></div>`;

    try {
        const response = await fetch('http://localhost:3000/news');
        const newsData = await response.json();

        container.innerHTML = '';

        // Improved filtering logic
        const barcaNews = newsData.articles.filter(article => {
            const title = article.title ? article.title.toLowerCase() : '';
            const description = article.description ? article.description.toLowerCase() : '';

            // Keywords to look for
            const keywords = [
                'barcelona', 'barca', 'barça',
                'fc barcelona', 'fcb', 'blaugrana',
                'camp nou'
            ];

            // Check if any keyword exists in title or description
            return keywords.some(keyword =>
                title.includes(keyword) ||
                description.includes(keyword)
            );
        }).slice(0, 5); // Only show first 5 matches

        if (barcaNews.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-500">No relevant news found.</p>';
            return;
        }

        barcaNews.forEach(article => {
            const card = document.createElement('div');
            card.className = 'news-card glass p-4 rounded-xl shadow-md fade-in hover:bg-white/5 transition-all';
            card.innerHTML = `
                <div class="relative overflow-hidden rounded-lg mb-4 h-48">
                    <img src="${article.urlToImage || 'https://placehold.co/600x400?text=No+Image'}"
                         class="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 class="text-xl font-bold mb-2 text-white leading-tight">${article.title}</h3>
                <p class="text-gray-400 mb-4 text-sm line-clamp-3">${article.description || ''}</p>
                <a href="${article.url}" target="_blank" class="text-[#fdd516] font-semibold hover:underline flex items-center gap-2">
                    Read More <i class="fas fa-external-link-alt text-xs"></i>
                </a>
            `;
            container.appendChild(card);
        });
    } catch (err) {
        container.innerHTML = '<p class="text-center text-red-500">Failed to load news.</p>';
        console.error('Error loading news:', err);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
