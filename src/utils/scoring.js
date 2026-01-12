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

// Get all eliminated teams from results (teams that lost a game)
export const getEliminatedTeams = (results, teams) => {
  if (!results || !teams) return [];

  const eliminated = [];
  const allTeams = [...(teams.afc || []), ...(teams.nfc || [])];
  const getTeamByName = (name) => allTeams.find(t => t.name === name);

  // Helper to check a round's games
  const checkRound = (roundData, conference, getMatchupTeams) => {
    if (!roundData || !roundData[conference]) return;

    Object.entries(roundData[conference]).forEach(([gameId, game]) => {
      if (game?.winner) {
        // Find the loser - need to know who played
        const matchupTeams = getMatchupTeams(gameId, conference);
        if (matchupTeams) {
          const loser = matchupTeams.find(t => t !== game.winner);
          if (loser && !eliminated.includes(loser)) {
            eliminated.push(loser);
          }
        }
      }
    });
  };

  // Wild Card matchups by seed
  const wcMatchups = {
    'wc_2v7': (conf) => {
      const t2 = allTeams.find(t => t.seed === 2 && teams[conf]?.includes(t));
      const t7 = allTeams.find(t => t.seed === 7 && teams[conf]?.includes(t));
      return [t2?.name, t7?.name].filter(Boolean);
    },
    'wc_3v6': (conf) => {
      const t3 = allTeams.find(t => t.seed === 3 && teams[conf]?.includes(t));
      const t6 = allTeams.find(t => t.seed === 6 && teams[conf]?.includes(t));
      return [t3?.name, t6?.name].filter(Boolean);
    },
    'wc_4v5': (conf) => {
      const t4 = allTeams.find(t => t.seed === 4 && teams[conf]?.includes(t));
      const t5 = allTeams.find(t => t.seed === 5 && teams[conf]?.includes(t));
      return [t4?.name, t5?.name].filter(Boolean);
    },
  };

  // Check Wild Card
  ['afc', 'nfc'].forEach(conf => {
    if (results.wildCard?.[conf]) {
      Object.entries(results.wildCard[conf]).forEach(([gameId, game]) => {
        if (game?.winner && wcMatchups[gameId]) {
          const matchupTeams = wcMatchups[gameId](conf);
          const loser = matchupTeams.find(t => t !== game.winner);
          if (loser && !eliminated.includes(loser)) {
            eliminated.push(loser);
          }
        }
      });
    }
  });

  // For later rounds, any team that's in the results as a loser
  // Check Divisional
  ['afc', 'nfc'].forEach(conf => {
    if (results.divisional?.[conf]) {
      Object.values(results.divisional[conf]).forEach(game => {
        if (game?.winner) {
          // Get all teams still in contention for this conf at divisional
          const confTeams = teams[conf] || [];
          const wcLosers = eliminated.filter(t => confTeams.some(ct => ct.name === t));
          const stillAlive = confTeams.filter(t => !wcLosers.includes(t.name));

          // The loser is a team that was alive but isn't the winner
          stillAlive.forEach(t => {
            if (t.name !== game.winner) {
              // This is a potential loser - but we need to know if they played
              // For simplicity, we'll mark based on who was supposed to be in this round
            }
          });
        }
      });
    }
  });

  // Conference Championship
  ['afc', 'nfc'].forEach(conf => {
    if (results.conference?.[conf]) {
      const confData = results.conference[conf];
      const winner = confData.winner || confData.championship?.winner;
      if (winner) {
        // The other team in the conference championship lost
        // This would be one of the divisional winners
      }
    }
  });

  // Super Bowl
  if (results.superBowl?.winner) {
    // The other conference champion lost
  }

  return eliminated;
};

// Simpler approach: get losers directly from the game results we have
export const getTeamsWhoLost = (results, teams) => {
  if (!results || !teams) return new Set();

  const losers = new Set();
  const allTeams = [...(teams.afc || []), ...(teams.nfc || [])];

  const getTeamBySeed = (conf, seed) => {
    return teams[conf]?.find(t => t.seed === seed)?.name;
  };

  // Wild Card - we know the matchups by seed
  ['afc', 'nfc'].forEach(conf => {
    if (results.wildCard?.[conf]) {
      const wc = results.wildCard[conf];

      // #2 vs #7
      if (wc.wc_2v7?.winner) {
        const t2 = getTeamBySeed(conf, 2);
        const t7 = getTeamBySeed(conf, 7);
        if (wc.wc_2v7.winner === t2 && t7) losers.add(t7);
        if (wc.wc_2v7.winner === t7 && t2) losers.add(t2);
      }

      // #3 vs #6
      if (wc.wc_3v6?.winner) {
        const t3 = getTeamBySeed(conf, 3);
        const t6 = getTeamBySeed(conf, 6);
        if (wc.wc_3v6.winner === t3 && t6) losers.add(t6);
        if (wc.wc_3v6.winner === t6 && t3) losers.add(t3);
      }

      // #4 vs #5
      if (wc.wc_4v5?.winner) {
        const t4 = getTeamBySeed(conf, 4);
        const t5 = getTeamBySeed(conf, 5);
        if (wc.wc_4v5.winner === t4 && t5) losers.add(t5);
        if (wc.wc_4v5.winner === t5 && t4) losers.add(t4);
      }
    }
  });

  // Divisional - need to figure out who played based on wild card results
  ['afc', 'nfc'].forEach(conf => {
    if (results.divisional?.[conf]) {
      Object.values(results.divisional[conf]).forEach(game => {
        if (game?.winner) {
          // Find teams that could have been in this game
          // The winner won, so any other team that's not eliminated
          // and was supposed to play is the loser
        }
      });
    }
  });

  // Conference Championship
  ['afc', 'nfc'].forEach(conf => {
    const confResult = results.conference?.[conf];
    if (confResult) {
      const winner = confResult.winner || confResult.championship?.winner;
      // The loser would be found from divisional winners minus this winner
    }
  });

  // Super Bowl
  if (results.superBowl?.winner) {
    // Loser is the other conference champion
    const afcChamp = results.conference?.afc?.winner || results.conference?.afc?.championship?.winner;
    const nfcChamp = results.conference?.nfc?.winner || results.conference?.nfc?.championship?.winner;
    if (afcChamp && nfcChamp) {
      if (results.superBowl.winner === afcChamp) losers.add(nfcChamp);
      if (results.superBowl.winner === nfcChamp) losers.add(afcChamp);
    }
  }

  return losers;
};
