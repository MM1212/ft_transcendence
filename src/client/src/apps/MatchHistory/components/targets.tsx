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

const SampleMatchHistoryScoreBoard: MatchHistoryScoreBoardProps = {
    teams: ["team1", "team1", "team2", "team1"],
    playerStats: [
        {
            nbGoals: 3,
            nbBounces: 4,
            mostBounces: 5,
            nbSpecialPowers: 6,
            nbGold: 7,
            playerScore: 4.2,
        },
        {
            nbGoals: 3,
            nbBounces: 4,
            mostBounces: 5,
            nbSpecialPowers: 6,
            nbGold: 7,
            playerScore: 7.5,
        },
        {
            nbGoals: 3,
            nbBounces: 4,
            mostBounces: 5,
            nbSpecialPowers: 6,
            nbGold: 7,
            playerScore: 8.3,
        },
        {
            nbGoals: 3,
            nbBounces: 4,
            mostBounces: 5,
            nbSpecialPowers: 6,
            nbGold: 7,
            playerScore: 9.2,
        },
    ],
};