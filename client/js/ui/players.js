import { DOM, state } from '../config.js';
import { getLastName, formatNumber, formatRating } from '../utils.js';
import { getPlayerDetails } from '../api.js';

function getShirtDisplay(player) {
    const number = formatNumber(player.shirtNumber, 'N/A');
    return number;
}

export function updateFilterButtons(position) {
    DOM.playerFilters.forEach((btn) => {
        if (btn.dataset.position === position) {
            btn.classList.remove('hover:bg-white/10', 'text-gray-300', 'hover:text-white');
            btn.classList.add('bg-[#db0030]', 'text-white', 'shadow-lg', 'shadow-red-900/20');
        } else {
            btn.classList.add('hover:bg-white/10', 'text-gray-300', 'hover:text-white');
            btn.classList.remove('bg-[#db0030]', 'text-white', 'shadow-lg', 'shadow-red-900/20');
        }
    });
}

export function renderPlayers(playersList) {
    const container = DOM.playersContainer;
    if (!container) return;

    container.innerHTML = '';

    if (!playersList.length) {
        container.innerHTML = `
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

        container.appendChild(playerCard);
    });
}

export function applyPlayerFilter() {
    const filteredPlayers = state.activeFilter === 'all'
        ? state.players
        : state.players.filter((player) => player.position === state.activeFilter);

    renderPlayers(filteredPlayers);
    updateFilterButtons(state.activeFilter);
}

export function setModalLoadingState() {
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

export function applyPlayerToModal(player) {
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

export async function openPlayerModal(playerId) {
    const player = state.players.find((entry) => entry.id == playerId);
    if (!player) return;

    applyPlayerToModal(player);
    DOM.playerModal.classList.add('active');

    try {
        const detailPlayer = await getPlayerDetails(playerId);
        if (detailPlayer) {
            const mergedPlayer = { ...player, ...detailPlayer };
            state.players = state.players.map((entry) => (entry.id == playerId ? mergedPlayer : entry));
            applyPlayerToModal(mergedPlayer);
        }
    } catch (error) {
        console.error('Error loading player details:', error);
    }
}
