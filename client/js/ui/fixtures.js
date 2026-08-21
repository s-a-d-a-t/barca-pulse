import { DOM } from '../config.js';

export function smoothScrollTo(targetLeft) {
    if (!DOM.fixturesContainer) return;
    
    // Temporarily disable scroll snapping to prevent snap cancellation during smooth programmatic scroll
    DOM.fixturesContainer.style.scrollSnapType = 'none';
    
    DOM.fixturesContainer.scrollTo({
        left: targetLeft,
        behavior: 'smooth'
    });
    
    // Restore scroll snap after the smooth scroll completes (typically 500ms)
    setTimeout(() => {
        DOM.fixturesContainer.style.scrollSnapType = 'x mandatory';
        updateFixtureDeckEffect();
    }, 500);
}

export function updateFixtureDeckEffect() {
    const prevBtn = document.getElementById('fixtures-prev');
    const nextBtn = document.getElementById('fixtures-next');
    if (!DOM.fixturesContainer) return;

    const scrollLeft = DOM.fixturesContainer.scrollLeft;
    const containerWidth = DOM.fixturesContainer.clientWidth || 320;
    const maxScroll = DOM.fixturesContainer.scrollWidth - containerWidth;

    // Update Navigation buttons
    if (prevBtn && nextBtn) {
        if (scrollLeft <= 5) {
            prevBtn.classList.add('nav-disabled');
        } else {
            prevBtn.classList.remove('nav-disabled');
        }

        if (scrollLeft >= maxScroll - 5) {
            nextBtn.classList.add('nav-disabled');
        } else {
            nextBtn.classList.remove('nav-disabled');
        }
    }

    // Update Card Stacking / Deck Reveal Effect
    const cards = DOM.fixturesContainer.querySelectorAll('.fixture-card');
    cards.forEach((card, index) => {
        const cardScrollPos = index * containerWidth;
        const diff = scrollLeft - cardScrollPos;
        const ratio = diff / containerWidth; // 0 when active, 1 when scrolled away, -1 when upcoming

        if (ratio > 0 && ratio <= 1.05) {
            // Scrolled away (to the left) - scale down, fade, slide slightly down
            card.style.transform = `scale(${1 - ratio * 0.15}) translateY(${ratio * 12}px) translateZ(0)`;
            card.style.opacity = `${1 - ratio * 0.8}`;
            card.style.pointerEvents = 'none';
        } else if (ratio < 0) {
            // Upcoming card (to the right) - reset to default (will slide in using CSS position: sticky)
            card.style.transform = 'scale(1) translateY(0) translateZ(0)';
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        } else {
            // Fully active card
            card.style.transform = 'scale(1) translateY(0) translateZ(0)';
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        }
    });
}

export function renderFixtures(fixtures) {
    if (!DOM.fixturesContainer) return;

    DOM.fixturesContainer.innerHTML = '';

    if (!fixtures.length) {
        DOM.fixturesContainer.innerHTML = `
            <div class="col-span-full text-center text-gray-400 py-12">
                No upcoming fixtures found right now.
            </div>
        `;
        return;
    }

    // Sort by date ascending (nearest upcoming first)
    const sortedFixtures = [...fixtures].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    sortedFixtures.forEach((fixture) => {
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

        // Generate initials for the opponent
        const oppInitials = (fixture.opponent || 'OPP')
            .split(/\s+/)
            .map((p) => p[0])
            .join('')
            .slice(0, 3)
            .toUpperCase();

        const oppCrest = fixture.opponentCrest
            ? `<img src="${fixture.opponentCrest}" alt="${fixture.opponent}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : '';

        const barcaCrest = fixture.barcaCrest
            ? `<img src="${fixture.barcaCrest}" alt="FC Barcelona" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
            : `<img src="https://ssl.gstatic.com/onebox/media/sports/logos/paYnEE8hcrP96neHRNofhQ_64x64.png" alt="FC Barcelona">`;

        // Home / Away ordering
        let homeTeamName, homeLogoHTML, awayTeamName, awayLogoHTML;

        if (fixture.venue === 'Home') {
            homeTeamName = 'FC Barcelona';
            homeLogoHTML = `
                ${barcaCrest}
                <div class="w-full h-full rounded-full bg-gradient-to-br from-[#002855] to-[#db0030] flex items-center justify-center text-xs font-bold text-white" style="display: none;">
                    FCB
                </div>
            `;
            awayTeamName = fixture.opponent;
            awayLogoHTML = `
                ${oppCrest}
                <div class="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xs font-bold text-[#fdd516]" style="${fixture.opponentCrest ? 'display: none;' : 'display: flex;'}">
                    ${oppInitials}
                </div>
            `;
        } else {
            homeTeamName = fixture.opponent;
            homeLogoHTML = `
                ${oppCrest}
                <div class="w-full h-full rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xs font-bold text-[#fdd516]" style="${fixture.opponentCrest ? 'display: none;' : 'display: flex;'}">
                    ${oppInitials}
                </div>
            `;
            awayTeamName = 'FC Barcelona';
            awayLogoHTML = `
                ${barcaCrest}
                <div class="w-full h-full rounded-full bg-gradient-to-br from-[#002855] to-[#db0030] flex items-center justify-center text-xs font-bold text-white" style="display: none;">
                    FCB
                </div>
            `;
        }

        const card = document.createElement('div');
        card.className = 'fixture-card fade-in';
        card.innerHTML = `
            <div class="fixture-header">
                <span class="fixture-badge-league">${fixture.competitionCode || 'Fixture'}</span>
                <span class="fixture-badge-matchday">Matchday ${fixture.matchday || 'N/A'}</span>
            </div>
            
            <div class="fixture-matchup">
                <div class="fixture-team">
                    <div class="fixture-logo">
                        ${homeLogoHTML}
                    </div>
                    <span class="fixture-team-name">${homeTeamName}</span>
                </div>
                
                <div class="fixture-vs-divider">
                    <div class="fixture-vs-circle">VS</div>
                </div>
                
                <div class="fixture-team">
                    <div class="fixture-logo">
                        ${awayLogoHTML}
                    </div>
                    <span class="fixture-team-name">${awayTeamName}</span>
                </div>
            </div>
            
            <div class="fixture-details">
                <div class="fixture-info-row">
                    <i class="fas fa-calendar-alt"></i>
                    <span>Date</span>
                    <span class="fixture-info-value">${formattedDate}</span>
                </div>
                <div class="fixture-info-row">
                    <i class="fas fa-clock"></i>
                    <span>Kickoff</span>
                    <span class="fixture-info-value">${formattedTime}</span>
                </div>
                <div class="fixture-info-row">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>Venue</span>
                    <span class="fixture-info-value">${fixture.venue === 'Home' ? 'Spotify Camp Nou' : 'Away'}</span>
                </div>
            </div>
            
            <div class="fixture-card-footer">
                <div class="fixture-comp-pill">
                    <i class="fas fa-trophy"></i>
                    <span>${fixture.competition}</span>
                </div>
            </div>
        `;
        DOM.fixturesContainer.appendChild(card);
    });

    // Update navigation arrows and stack deck state after cards are rendered
    setTimeout(updateFixtureDeckEffect, 100);
}
