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

    matches(matches, teamId) {
        const container = document.getElementById('matches-list');
        container.innerHTML = '';

        if (matches.length === 0) {
            container.innerHTML = '<p class="empty-state">Keine Spiele gefunden.</p>';
            return;
        }

        matches.forEach(match => {
            const isHome = match.team1.teamId === teamId;
            const opponent = isHome ? match.team2.teamName : match.team1.teamName;
            const myScore = isHome ? match.matchResults[1]?.pointsTeam1 : match.matchResults[1]?.pointsTeam2; // matchResults[1] is usually end result
            const opScore = isHome ? match.matchResults[1]?.pointsTeam2 : match.matchResults[1]?.pointsTeam1;

            // Fallback for results if matchResults[1] undefined (sometimes index varies)
            // Ideally we check ResultName usually "Endergebnis"
            const finalResult = match.matchResults.find(r => r.resultName === "Endergebnis") || match.matchResults[0];
            const homePoints = finalResult?.pointsTeam1;
            const guestPoints = finalResult?.pointsTeam2;

            const myPoints = isHome ? homePoints : guestPoints;
            const opPoints = isHome ? guestPoints : homePoints;

            let resultClass = 'draw';
            if (myPoints > opPoints) resultClass = 'win';
            if (myPoints < opPoints) resultClass = 'loss';

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
                <div class="match-result">${homePoints}:${guestPoints}</div>
            `;
            container.appendChild(div);
        });
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
                <td>${index + 1}.</td>
                <td>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <img src="${row.teamIconUrl}" style="width:20px; height:20px; object-fit:contain;" alt="">
                        ${row.teamName}
                    </div>
                </td>
                <td class="mobile-hide">${row.matches}</td>
                <td class="mobile-hide">${row.goals}:${row.opponentGoals}</td>
                <td><strong>${row.points}</strong></td>
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
