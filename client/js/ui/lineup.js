import { DOM } from '../config.js';
import { parseFormation, parseGrid, formatNumber, getLastName, getCoachPlaceholder } from '../utils.js';

export function renderCoachCard(coachName) {
    if (!DOM.headCoachName || !DOM.headCoachRole || !DOM.headCoachDescription || !DOM.headCoachPhoto) {
        return;
    }

    if (!coachName || coachName === 'Unknown Coach' || coachName === 'Unavailable') {
        return;
    }

    DOM.headCoachName.textContent = coachName;
    DOM.headCoachRole.textContent = 'Head Coach';
    DOM.headCoachDescription.textContent = `Latest lineup coach fetched from API-Football for BarçaPulse.`;
    DOM.headCoachPhoto.src = getCoachPlaceholder(coachName);
    DOM.headCoachPhoto.alt = coachName;
}

export function renderLineup(lineup) {
    if (!DOM.formationContainer) return;

    DOM.formationContainer.innerHTML = '';
    if (DOM.benchContainer) DOM.benchContainer.innerHTML = '';

    if (!lineup || !Array.isArray(lineup.startXI) || lineup.startXI.length === 0) {
        DOM.formationContainer.innerHTML = `
            <div class="absolute inset-0 flex items-center justify-center text-center px-6">
                <div>
                    <p class="text-white font-semibold text-lg mb-2">Lineup data is unavailable right now.</p>
                    <p class="text-gray-300 text-sm">We’ll show the latest API-Football lineup as soon as it becomes available.</p>
                </div>
            </div>
        `;
        if (DOM.benchContainer) {
            DOM.benchContainer.innerHTML = `
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

            DOM.formationContainer.appendChild(shirt);
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

        DOM.formationContainer.appendChild(gk);
    }

    if (DOM.lineupFormationLabel) {
        DOM.lineupFormationLabel.textContent = lineup.formation || '4-3-3';
    }
    if (DOM.lineupSourceBadge) {
        const isUpcoming = lineup.lineupType === 'upcoming';
        DOM.lineupSourceBadge.textContent = isUpcoming ? 'Upcoming' : 'Last match';
        DOM.lineupSourceBadge.className = isUpcoming
            ? 'inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300'
            : 'inline-flex items-center rounded-full border border-[#fdd516]/40 bg-[#fdd516]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#fdd516]';
    }
    if (DOM.lineupCoachLabel) {
        DOM.lineupCoachLabel.textContent = `Coach: ${lineup.coach || 'Unavailable'}`;
    }
    if (DOM.lineupOpponentLabel) {
        DOM.lineupOpponentLabel.textContent = lineup.opponent
            ? `${lineup.lineupType === 'upcoming' ? 'Upcoming lineup' : 'Latest lineup'} vs ${lineup.opponent}`
            : 'Latest lineup';
    }

    renderCoachCard(lineup.coach);

    if (DOM.benchContainer) {
        if (!Array.isArray(lineup.bench) || lineup.bench.length === 0) {
            DOM.benchContainer.innerHTML = `
                <div class="col-span-full text-center text-gray-400 py-6">
                    Bench data is unavailable.
                </div>
            `;
        } else {
            DOM.benchContainer.innerHTML = '';
            lineup.bench.forEach((player) => {
                const benchCard = document.createElement('div');
                benchCard.className = 'glass rounded-xl p-3 text-center border border-white/10';
                benchCard.innerHTML = `
                    <div class="text-[#fdd516] text-xs uppercase tracking-[0.2em] mb-2">#${formatNumber(player.number ?? player.shirtNumber, 'N/A')}</div>
                    <div class="text-white font-semibold text-sm leading-tight">${player.name}</div>
                    <div class="text-gray-400 text-xs uppercase tracking-wider mt-1">${player.position || 'Substitute'}</div>
                `;
                DOM.benchContainer.appendChild(benchCard);
            });
        }
    }
}
