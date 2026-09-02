export function showLoadingState(container, message) {
    if (!container) return;

    container.innerHTML = `
        <div class="col-span-full flex items-center justify-center py-12">
            <div class="spinner"></div>
        </div>
        <p class="col-span-full text-center text-gray-400 -mt-4">${message}</p>
    `;
}

export function parseGrid(grid) {
    if (!grid || typeof grid !== 'string' || !grid.includes(':')) {
        return null;
    }

    const [row, column] = grid.split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isNaN(row) || Number.isNaN(column)) {
        return null;
    }

    return { row, column };
}

export function parseFormation(formation) {
    const parts = String(formation || '4-3-3')
        .split('-')
        .map((part) => Number.parseInt(part, 10))
        .filter((part) => Number.isFinite(part) && part > 0);

    return parts.length ? parts : [4, 3, 3];
}

export function formatNumber(value, fallback = 'N/A') {
    return value === null || value === undefined || value === '' ? fallback : value;
}

export function formatRating(value) {
    if (value === null || value === undefined || value === '') {
        return 'N/A';
    }

    const numeric = Number.parseFloat(value);
    return Number.isFinite(numeric) ? numeric.toFixed(2) : 'N/A';
}

export function getLastName(name) {
    if (!name) return 'Player';
    const trimmed = String(name).trim();
    if (trimmed.includes('ter Stegen')) return 'ter Stegen';
    if (trimmed.includes('de Jong')) return 'de Jong';
    if (trimmed.includes('Cubarsí') || trimmed.includes('Cubarsi')) return 'Cubarsí';
    if (trimmed.includes('Szczęsny') || trimmed.includes('Szczesny')) return 'Szczęsny';
    if (trimmed.includes('Martínez') || trimmed.includes('Martinez')) return 'Íñigo Martínez';
    if (trimmed.includes('Yamal')) return 'Lamine Yamal';
    if (trimmed.includes('Raphinha')) return 'Raphinha';
    if (trimmed.includes('Lewandowski')) return 'Lewandowski';
    if (trimmed.includes('Olmo')) return 'Dani Olmo';
    if (trimmed.includes('Koundé') || trimmed.includes('Kounde')) return 'Jules Koundé';

    const parts = trimmed.split(/\s+/);
    if (parts.length <= 2) return trimmed;
    return parts.slice(1).join(' ');
}

export function getCoachPlaceholder(name) {
    const coachName = String(name || 'Coach').trim();
    const initials = coachName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('.');

    return `https://placehold.co/250x250/002855/ffffff?text=${encodeURIComponent(initials || 'Coach')}`;
}
