/**
 * Main Application Logic
 */
import { api } from './api.js';
import { state } from './state.js';
import { render } from './render.js';

// DOM Elements
const searchInput = document.getElementById('team-search');
const searchResultsContainer = document.getElementById('search-results');
const favoritesContainer = document.getElementById('favorites-list');
const recentsContainer = document.getElementById('recents-list');
const favBtn = document.getElementById('btn-favorite');
let currentTeam = null;

async function init() {
    state.init();
    renderSidebar();

    // Initial Data Load
    try {
        render.showLoading(true);
        const teams = await api.buildTeamIndex();
        console.log('Team Index Built:', teams.length, 'teams');
    } catch (err) {
        console.error('Init error:', err);
        render.showError('Fehler beim Laden der Ligadaten.');
    } finally {
        render.showLoading(false);
    }

    setupEventListeners();
}

function renderSidebar() {
    render.teamList(state.favorites, favoritesContainer, loadTeamDetails);
    render.teamList(state.recents, recentsContainer, loadTeamDetails);
}

function setupEventListeners() {
    // Search Input
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            render.searchResults([], searchResultsContainer, null);
            return;
        }

        // Filter teams
        const filtered = state.teamsIndex.filter(t =>
            t.teamName.toLowerCase().includes(query)
        ).slice(0, 10); // Limit proposals

        render.searchResults(filtered, searchResultsContainer, (team) => {
            searchInput.value = ''; // Clear input
            render.searchResults([], searchResultsContainer, null); // Hide results
            loadTeamDetails(team);
        });
    });

    // Close search on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            render.searchResults([], searchResultsContainer, null);
        }
    });

    // Favorite Button
    favBtn.addEventListener('click', () => {
        if (!currentTeam) return;

        if (state.isFavorite(currentTeam.teamId)) {
            state.removeFavorite(currentTeam.teamId);
        } else {
            state.addFavorite(currentTeam);
        }

        // Re-render header to toggle star, and sidebar
        render.teamHeader(currentTeam, state.isFavorite(currentTeam.teamId));
        renderSidebar();
    });
}

async function loadTeamDetails(team) {
    currentTeam = team;
    state.addToRecents(team);
    renderSidebar(); // Update recents list immediately

    // UI Updates
    render.showContentArea();
    render.teamHeader(team, state.isFavorite(team.teamId));

    try {
        render.showLoading(true);
        render.showError(null);

        // Fetch parallel
        const [matches, table] = await Promise.all([
            api.getTeamMatches(team),
            api.getLeagueTable(team.leagueShortcut, team.leagueSeason)
        ]);

        render.matches(matches, team.teamId);
        render.table(table, team.teamId);

    } catch (err) {
        console.error('Load details error:', err);
        render.showError('Daten konnten nicht geladen werden.');
    } finally {
        render.showLoading(false);
    }
}

// Start
document.addEventListener('DOMContentLoaded', init);
