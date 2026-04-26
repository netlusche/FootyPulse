/**
 * State Management
 * Handles caching and persistence (favorites, recents)
 */

const STATE_KEYS = {
    TEAMS_INDEX: 'footypulse_teams_index_v2',
    FAVORITES: 'footypulse_favorites',
    RECENTS: 'footypulse_recents',
    THEME: 'footypulse_theme',
    CACHE_PREFIX: 'footypulse_cache_'
};

const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export const state = {
    favorites: [],
    recents: [],
    teamsIndex: [], // Array of { teamId, teamName, leagueShortcut, leagueSeason }
    theme: 'light',

    init() {
        this.loadFavorites();
        this.loadRecents();
        this.loadTeamsIndex();
        this.loadTheme();
    },

    // --- Theme ---
    loadTheme() {
        const stored = localStorage.getItem(STATE_KEYS.THEME);
        this.theme = stored || 'light';
    },

    saveTheme(theme) {
        this.theme = theme;
        localStorage.setItem(STATE_KEYS.THEME, theme);
    },

    // --- Favorites ---
    loadFavorites() {
        const stored = localStorage.getItem(STATE_KEYS.FAVORITES);
        this.favorites = stored ? JSON.parse(stored) : [];
    },

    saveFavorites() {
        localStorage.setItem(STATE_KEYS.FAVORITES, JSON.stringify(this.favorites));
    },

    addFavorite(team) {
        if (!this.isFavorite(team.teamId)) {
            this.favorites.push(team);
            this.saveFavorites();
        }
    },

    removeFavorite(teamId) {
        this.favorites = this.favorites.filter(t => t.teamId !== teamId);
        this.saveFavorites();
    },

    isFavorite(teamId) {
        return this.favorites.some(t => t.teamId === teamId);
    },

    // --- Recents ---
    loadRecents() {
        const stored = localStorage.getItem(STATE_KEYS.RECENTS);
        this.recents = stored ? JSON.parse(stored) : [];
    },

    saveRecents() {
        localStorage.setItem(STATE_KEYS.RECENTS, JSON.stringify(this.recents));
    },

    addToRecents(team) {
        // Remove if exists to move to top
        this.recents = this.recents.filter(t => t.teamId !== team.teamId);
        // Add to beginning
        this.recents.unshift(team);
        // Limit to 5
        if (this.recents.length > 5) this.recents.pop();
        this.saveRecents();
    },

    // --- Team Index (for search) ---
    loadTeamsIndex() {
        const stored = localStorage.getItem(STATE_KEYS.TEAMS_INDEX);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Simple expiry check for the index (e.g., older than 24h?)
            // For now, we rely on the API.js to decide when to rebuild, 
            // but we store it here to make it accessible synchronously.
            this.teamsIndex = parsed.data || [];
        }
    },

    saveTeamsIndex(teamsData) {
        this.teamsIndex = teamsData;
        localStorage.setItem(STATE_KEYS.TEAMS_INDEX, JSON.stringify({
            timestamp: Date.now(),
            data: teamsData
        }));
    },

    // --- API Cache Helpers ---
    getCache(key) {
        const item = localStorage.getItem(STATE_KEYS.CACHE_PREFIX + key);
        if (!item) return null;

        const parsed = JSON.parse(item);
        const now = Date.now();
        if (now - parsed.timestamp > CACHE_DURATION_MS) {
            localStorage.removeItem(STATE_KEYS.CACHE_PREFIX + key);
            return null;
        }

        return parsed.data;
    },

    setCache(key, data) {
        localStorage.setItem(STATE_KEYS.CACHE_PREFIX + key, JSON.stringify({
            timestamp: Date.now(),
            data: data
        }));
    }
};
