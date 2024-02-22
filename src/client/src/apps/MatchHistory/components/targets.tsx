export interface PlayerStatsRowProps {
    nbGoals: number;
    nbBounces: number;
    mostBounces: number;
    nbSpecialPowers: number;
    nbGold: number;
    playerScore: number;
}

export interface MatchHistoryScoreBoardProps {
    teams: string[];
    playerStats: PlayerStatsRowProps[];
}
