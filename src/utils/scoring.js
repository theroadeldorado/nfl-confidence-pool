import { ROUNDS } from '../constants/rounds';

// Get all winning teams from results
export const getAllWinners = (results) => {
  if (!results) return [];

  const winners = [];

  // Wild Card winners
  if (results.wildCard) {
    ['afc', 'nfc'].forEach(conf => {
      if (results.wildCard[conf]) {
        Object.values(results.wildCard[conf]).forEach(game => {
          if (game?.winner) winners.push(game.winner);
        });
      }
    });
  }

  // Divisional winners
  if (results.divisional) {
    ['afc', 'nfc'].forEach(conf => {
      if (results.divisional[conf]) {
        Object.values(results.divisional[conf]).forEach(game => {
          if (game?.winner) winners.push(game.winner);
        });
      }
    });
  }

  // Conference winners
  if (results.conference) {
    ['afc', 'nfc'].forEach(conf => {
      if (results.conference[conf]) {
        // Handle both old format (direct winner) and new format (championship game)
        if (results.conference[conf].winner) {
          winners.push(results.conference[conf].winner);
        } else if (results.conference[conf].championship?.winner) {
          winners.push(results.conference[conf].championship.winner);
        } else {
          // Check for any game object with winner
          Object.values(results.conference[conf]).forEach(game => {
            if (game?.winner) winners.push(game.winner);
          });
        }
      }
    });
  }

  // Super Bowl winner
  if (results.superBowl?.winner) {
    winners.push(results.superBowl.winner);
  }

  return winners;
};

// Calculate score for a single entry
export const calculateScore = (rankings, results) => {
  if (!rankings || !results) return 0;

  const winners = getAllWinners(results);
  let score = 0;

  for (const winner of winners) {
    if (rankings[winner]) {
      score += rankings[winner];
    }
  }

  return score;
};

// Calculate potential remaining points (teams not eliminated)
export const calculatePotentialPoints = (rankings, teams) => {
  if (!rankings || !teams) return 0;

  const allTeams = [...(teams.afc || []), ...(teams.nfc || [])];
  let potential = 0;

  for (const team of allTeams) {
    if (!team.eliminated && rankings[team.name]) {
      potential += rankings[team.name];
    }
  }

  return potential;
};

// Get maximum possible remaining points (4 more wins possible per team max)
export const getMaxPossibleScore = (rankings, results, teams) => {
  const currentScore = calculateScore(rankings, results);
  const potential = calculatePotentialPoints(rankings, teams);
  // Each remaining team can win up to 4 games (WC, Div, Conf, SB)
  // But this is simplified - actual max depends on bracket position
  return currentScore + potential * 4;
};
