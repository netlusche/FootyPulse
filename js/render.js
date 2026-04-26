/**
 * Rendering Logic
 * UI Generation
 */

export const render = {
    searchResults(teams, container, onSelect) {
        container.innerHTML = '';
        if (teams.length === 0) {
            container.classList.add('hidden');
            return;
        }

        const leagueMap = {
            'bl1': '1. Bundesliga',
            'bl2': '2. Bundesliga',
            'bl3': '3. Liga'
        };

        teams.forEach(team => {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            const leagueName = leagueMap[team.leagueShortcut.toLowerCase()] || team.leagueName || team.leagueShortcut.toUpperCase();

            // Layout: "League - Team Name" as requested (e.g. "2. Bundesliga - Karlsruher SC")
            item.innerHTML = `
                <span class="search-result-team">${leagueName} - ${team.teamName}</span>
            `;
            item.addEventListener('click', () => {
                onSelect(team);
                container.classList.add('hidden');
            });
            container.appendChild(item);
        });
        container.classList.remove('hidden');
    },

    teamList(teams, container, onSelect) {
        container.innerHTML = '';
        if (teams.length === 0) {
            container.innerHTML = '<p class="empty-state">Keine Einträge.</p>';
            return;
        }

        teams.forEach(team => {
            const div = document.createElement('div');
            div.className = 'team-list-item';
            div.innerHTML = `<span>${team.teamName}</span>`; // Could add logo here
            div.addEventListener('click', () => onSelect(team));
            container.appendChild(div);
        });
    },

    teamHeader(team, isFavorite) {
        document.getElementById('team-name').textContent = team.teamName;
        const logo = document.getElementById('team-logo');
        if (team.teamIcon) {
            logo.src = team.teamIcon;
            logo.alt = team.teamName;
            logo.classList.remove('hidden');
        } else {
            logo.classList.add('hidden');
        }

        const favBtn = document.getElementById('btn-favorite');
        favBtn.innerHTML = isFavorite ? '<span class="icon">★</span>' : '<span class="icon">☆</span>';
        favBtn.setAttribute('aria-label', isFavorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen');
    },

    matches(matchData, teamId) {
        const { lastMatches, nextMatches } = matchData;
        const lastContainer = document.getElementById('matches-list');
        const nextContainer = document.getElementById('next-matches-list');
        const nextTitle = document.getElementById('next-matches-title');
        const formContainer = document.getElementById('form-display');

        lastContainer.innerHTML = '';
        nextContainer.innerHTML = '';
        formContainer.innerHTML = '';

        // --- Render Last Matches & Form ---
        if (lastMatches.length === 0) {
            lastContainer.innerHTML = '<p class="empty-state">Keine Spiele gefunden.</p>';
        } else {
            // Sort for UI (descending)
            const sortedLast = [...lastMatches].reverse();
            
            sortedLast.forEach(match => {
                const item = this.createMatchItem(match, teamId);
                lastContainer.appendChild(item);
            });

            // Compact Form Display (Chronological: oldest to newest)
            lastMatches.forEach(match => {
                const result = this.calculateResult(match, teamId);
                const span = document.createElement('span');
                span.className = `form-pill ${result}`;
                span.textContent = result.charAt(0).toUpperCase();
                formContainer.appendChild(span);
            });
        }

        // --- Render Next Matches ---
        if (nextMatches.length === 0) {
            nextTitle.classList.add('hidden');
            nextContainer.classList.add('hidden');
        } else {
            nextTitle.classList.remove('hidden');
            nextContainer.classList.remove('hidden');
            
            // Title logic
            nextTitle.textContent = nextMatches.length >= 10 ? 'Nächste Spiele' : 'Restprogramm';

            nextMatches.forEach(match => {
                const item = this.createMatchItem(match, teamId, false);
                nextContainer.appendChild(item);
            });
        }
    },

    createMatchItem(match, teamId, isFinished = true) {
        const isHome = match.team1.teamId === teamId;
        const opponent = isHome ? match.team2.teamName : match.team1.teamName;
        
        let resultHtml = '-:-';
        let resultClass = 'upcoming';

        if (isFinished) {
            const finalResult = match.matchResults.find(r => r.resultName === "Endergebnis") || match.matchResults[0];
            const homePoints = finalResult?.pointsTeam1;
            const guestPoints = finalResult?.pointsTeam2;
            resultHtml = `${homePoints}:${guestPoints}`;
            
            const res = this.calculateResult(match, teamId);
            resultClass = res;
        }

        const date = new Date(match.matchDateTime).toLocaleDateString('de-DE', {
            day: '2-digit', month: '2-digit'
        });

        const div = document.createElement('div');
        div.className = `match-item ${resultClass}`;
        div.innerHTML = `
            <div class="match-date">${date}</div>
            <div class="match-teams">
                ${isHome ? 'vs.' : '@'} ${opponent}
            </div>
            <div class="match-result">${resultHtml}</div>
        `;
        return div;
    },

    calculateResult(match, teamId) {
        const isHome = match.team1.teamId === teamId;
        const finalResult = match.matchResults.find(r => r.resultName === "Endergebnis") || match.matchResults[0];
        const myPoints = isHome ? finalResult?.pointsTeam1 : finalResult?.pointsTeam2;
        const opPoints = isHome ? finalResult?.pointsTeam2 : finalResult?.pointsTeam1;

        if (myPoints > opPoints) return 'win';
        if (myPoints < opPoints) return 'loss';
        return 'draw';
    },

    table(tableData, teamId) {
        const tbody = document.querySelector('#league-table tbody');
        tbody.innerHTML = '';

        tableData.forEach((row, index) => {
            const tr = document.createElement('tr');
            if (row.teamInfoId === teamId) {
                tr.classList.add('highlight-team');
            }

            tr.innerHTML = `
                <td>${index + 1}</td>
                <td class="team-cell">
                    <img src="${row.teamIconUrl}" alt="">
                    <span>${row.teamName}</span>
                </td>
                <td class="mobile-hide">${row.matches}</td>
                <td class="mobile-hide">${row.goals}:${row.opponentGoals}</td>
                <td class="points-cell">${row.points}</td>
            `;
            tbody.appendChild(tr);
        });
    },

    showLoading(isLoading) {
        const loading = document.getElementById('loading');
        if (isLoading) loading.classList.remove('hidden');
        else loading.classList.add('hidden');
    },

    showError(msg) {
        const err = document.getElementById('error-message');
        const txt = document.getElementById('error-text');
        if (msg) {
            txt.textContent = msg;
            err.classList.remove('hidden');
            setTimeout(() => err.classList.add('hidden'), 5000);
        } else {
            err.classList.add('hidden');
        }
    },

    showContentArea() {
        document.getElementById('content-area').classList.remove('hidden');
        // Mobile UX: scroll to content
        if (window.innerWidth < 768) {
            document.getElementById('content-area').scrollIntoView({ behavior: 'smooth' });
        }
    }
};
