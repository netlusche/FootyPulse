/**
 * API Logic
 * Fetch data from OpenLigaDB with caching
 */
import { state } from './state.js';

const BASE_URL = 'https://api.openligadb.de';
const RELEVANT_LEAGUES = ['bl1', 'bl2', 'bl3']; // Bundesliga 1, 2, 3

async function fetchWithCache(endpoint) {
    const cacheKey = endpoint;
    const cached = state.getCache(cacheKey);
    if (cached) {
        console.log(`[Cache Hit] ${endpoint}`);
        return cached;
    }

    console.log(`[API Fetch] ${endpoint}`);
    try {
        const response = await fetch(`${BASE_URL}${endpoint}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        state.setCache(cacheKey, data);
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
        throw error;
    }
}

export const api = {
    /**
     * Builds the team index by fetching available leagues (for filtering)
     * and then fetching the table for the latest season of relevant leagues.
     * We use the table endpoint because it contains clean team names and IDs for the season.
     */
    async buildTeamIndex() {
        // Return existing index if available and valid (handled by app init usually, but good safeguard)
        if (state.teamsIndex && state.teamsIndex.length > 0) {
            return state.teamsIndex;
        }

        const allLeagues = await fetchWithCache('/getavailableleagues');

        // Filter for relevant leagues (latest season only)
        // Group by leagueShortcut first to find max season
        const leagueMap = new Map();

        allLeagues.forEach(l => {
            if (RELEVANT_LEAGUES.includes(l.leagueShortcut.toLowerCase())) {
                const current = leagueMap.get(l.leagueShortcut);
                if (!current || parseInt(l.leagueSeason) > parseInt(current.leagueSeason)) {
                    leagueMap.set(l.leagueShortcut, l);
                }
            }
        });

        const targetLeagues = Array.from(leagueMap.values());

        // Fetch tables for these leagues to get teams
        let allTeams = [];

        await Promise.all(targetLeagues.map(async (league) => {
            try {
                const table = await fetchWithCache(`/getbltable/${league.leagueShortcut}/${league.leagueSeason}`);

                table.forEach(entry => {
                    allTeams.push({
                        teamId: entry.teamInfoId,
                        teamName: entry.teamName,
                        teamIcon: entry.teamIconUrl,
                        leagueShortcut: league.leagueShortcut,
                        leagueSeason: league.leagueSeason,
                        leagueName: league.leagueName
                    });
                });
            } catch (err) {
                console.warn(`Failed to fetch table for ${league.leagueShortcut}:`, err);
            }
        }));

        state.saveTeamsIndex(allTeams);
        return allTeams;
    },

    /**
     * Get Match data for a specific league season, then filter for a team.
     * (OpenLigaDB doesn't have a direct "get matches by team ID across all leagues" 
     * that is efficient efficiently without knowing the league, so we rely on the 
     * team index providing the league context).
     */
    async getTeamMatches(team) {
        // /getmatchdata/{leagueShortcut}/{leagueSeason}
        const allMatches = await fetchWithCache(`/getmatchdata/${team.leagueShortcut}/${team.leagueSeason}`);

        // Filter all matches for this team
        const teamMatches = allMatches.filter(m =>
            m.team1.teamId === team.teamId || m.team2.teamId === team.teamId
        );

        // Classification
        const pastMatches = teamMatches
            .filter(m => m.matchIsFinished === true)
            .sort((a, b) => new Date(a.matchDateTime) - new Date(b.matchDateTime)); // Ascending for slicing

        const futureMatches = teamMatches
            .filter(m => m.matchIsFinished === false)
            .sort((a, b) => new Date(a.matchDateTime) - new Date(b.matchDateTime));

        return {
            lastMatches: pastMatches.slice(-10), // Take the latest 10 finished
            nextMatches: futureMatches.slice(0, 10) // Take the next 10 upcoming
        };
    },

    async getLeagueTable(leagueShortcut, leagueSeason) {
        return await fetchWithCache(`/getbltable/${leagueShortcut}/${leagueSeason}`);
    }
};
