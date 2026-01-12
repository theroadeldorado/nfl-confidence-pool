import { useMemo } from 'react';
import { calculateScore, calculatePotentialPoints } from '../utils/scoring';

export const useLeaderboard = (entries, results, teams) => {
  const leaderboard = useMemo(() => {
    if (!entries) return [];

    const entryList = Object.entries(entries).map(([name, data]) => {
      const score = calculateScore(data.rankings, results);
      const potential = calculatePotentialPoints(data.rankings, teams);

      return {
        name,
        score,
        potential,
        maxPossible: score + potential,
        rankings: data.rankings,
        submittedAt: data.submittedAt,
      };
    });

    // Sort by score (descending), then by potential (descending)
    entryList.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return b.potential - a.potential;
    });

    // Assign ranks (handle ties)
    let currentRank = 1;
    let previousScore = null;

    return entryList.map((entry, index) => {
      if (previousScore !== null && entry.score < previousScore) {
        currentRank = index + 1;
      }
      previousScore = entry.score;
      return { ...entry, rank: currentRank };
    });
  }, [entries, results, teams]);

  return leaderboard;
};
