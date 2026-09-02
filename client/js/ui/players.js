import { DOM, state } from '../config.js';
import { getLastName, formatNumber } from '../utils.js';
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

        playerCard.innerHTML = `
            <div class="p-6 relative z-10">
                <div class="relative mx-auto w-32 h-32 mb-4 group-hover:scale-110 transition-transform duration-500">
                    <div class="w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                        <img src="${player.photo}"
                             alt="${player.name}"
                             class="w-full h-full object-cover"
                             onerror="this.onerror=null;this.src='https://placehold.co/250x250/002855/ffffff?text=Player';">
                    </div>
                    <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 player-number-badge text-white text-xs px-2.5 py-1 rounded-full font-bold border border-white/10 shadow-md">#${getShirtDisplay(player)}</div>
                </div>
                <h3 class="font-bold text-lg text-white mb-1">${getLastName(player.name)}</h3>
                <p class="text-gray-400 text-sm uppercase tracking-wider">${player.position}</p>
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
    document.getElementById('modal-player-age').textContent = '...';
    document.getElementById('modal-player-shirt').textContent = '...';
}

export function applyPlayerToModal(player) {
    document.getElementById('modal-player-img').src = player.photo;
    document.getElementById('modal-player-name').textContent = player.name;
    document.getElementById('modal-player-position').textContent = player.position;
    document.getElementById('modal-player-number').textContent = formatNumber(player.shirtNumber, 'N/A');
    document.getElementById('modal-player-age').textContent = formatNumber(player.age, 'N/A');
    document.getElementById('modal-player-shirt').textContent = formatNumber(player.shirtNumber, 'N/A');
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

