import { WILD_CARD_MATCHUPS } from '../constants/rounds';

// Get team by seed from teams array
export const getTeamBySeed = (teams, seed) => {
  return teams?.find(t => t.seed === seed) || null;
};

// Get Wild Card matchups for a conference
export const getWildCardMatchups = (teams) => {
  if (!teams || teams.length < 7) return [];

  return WILD_CARD_MATCHUPS.map(matchup => ({
    ...matchup,
    homeTeam: getTeamBySeed(teams, matchup.home),
    awayTeam: getTeamBySeed(teams, matchup.away),
  }));
};

// Get the 1 seed (bye team) for a conference
export const getByeTeam = (teams) => {
  return getTeamBySeed(teams, 1);
};

// Determine Divisional matchups based on Wild Card results
export const getDivisionalMatchups = (teams, wildCardResults) => {
  if (!teams || !wildCardResults) return [];

  const byeTeam = getByeTeam(teams);
  const wcWinners = [];

  // Collect Wild Card winners
  Object.values(wildCardResults).forEach(game => {
    if (game?.winner) {
      const winningTeam = teams.find(t => t.name === game.winner);
      if (winningTeam) wcWinners.push(winningTeam);
    }
  });

  if (wcWinners.length < 3) return [];

  // Sort winners by seed (lowest seed plays 1 seed)
  wcWinners.sort((a, b) => a.seed - b.seed);

  // 1 seed plays lowest remaining seed
  // Higher remaining seeds play each other
  return [
    {
      gameId: 'game1',
      homeTeam: byeTeam,
      awayTeam: wcWinners[2], // Lowest seed (highest number)
    },
    {
      gameId: 'game2',
      homeTeam: wcWinners[0], // Higher seed hosts
      awayTeam: wcWinners[1],
    },
  ];
};

// Determine Conference Championship matchup
export const getConferenceMatchup = (teams, divisionalResults) => {
  if (!teams || !divisionalResults) return null;

  const divWinners = [];

  Object.values(divisionalResults).forEach(game => {
    if (game?.winner) {
      const winningTeam = teams.find(t => t.name === game.winner);
      if (winningTeam) divWinners.push(winningTeam);
    }
  });

  if (divWinners.length < 2) return null;

  // Higher seed hosts
  divWinners.sort((a, b) => a.seed - b.seed);

  return {
    gameId: 'championship',
    homeTeam: divWinners[0],
    awayTeam: divWinners[1],
  };
};

// Get Super Bowl matchup
export const getSuperBowlMatchup = (afcTeams, nfcTeams, confResults) => {
  if (!confResults?.afc?.winner || !confResults?.nfc?.winner) return null;

  const afcChamp = afcTeams?.find(t => t.name === confResults.afc.winner);
  const nfcChamp = nfcTeams?.find(t => t.name === confResults.nfc.winner);

  if (!afcChamp || !nfcChamp) return null;

  return {
    gameId: 'superBowl',
    afcTeam: afcChamp,
    nfcTeam: nfcChamp,
  };
};

// Check if a team is eliminated
export const isTeamEliminated = (teamName, results) => {
  if (!results) return false;

  const winners = [];
  const losers = new Set();

  // Check all rounds for this team
  const checkRound = (roundResults) => {
    if (!roundResults) return;
    ['afc', 'nfc'].forEach(conf => {
      if (roundResults[conf]) {
        Object.values(roundResults[conf]).forEach(game => {
          if (game?.winner) {
            winners.push(game.winner);
            // If this team played and didn't win, they lost
            if (game.homeTeam === teamName || game.awayTeam === teamName) {
              if (game.winner !== teamName) {
                losers.add(teamName);
              }
            }
          }
        });
      }
    });
  };

  checkRound(results.wildCard);
  checkRound(results.divisional);

  // Conference round structure is different
  if (results.conference) {
    ['afc', 'nfc'].forEach(conf => {
      if (results.conference[conf]?.winner) {
        // Check if team was in this game and lost
      }
    });
  }

  return losers.has(teamName);
};
