export const ROUNDS = {
  WILD_CARD: 'wildCard',
  DIVISIONAL: 'divisional',
  CONFERENCE: 'conference',
  SUPER_BOWL: 'superBowl',
};

export const ROUND_NAMES = {
  [ROUNDS.WILD_CARD]: 'Wild Card',
  [ROUNDS.DIVISIONAL]: 'Divisional',
  [ROUNDS.CONFERENCE]: 'Conference',
  [ROUNDS.SUPER_BOWL]: 'Super Bowl',
};

// NFL Playoff bracket seeding rules
// 1 seed gets bye, 2 vs 7, 3 vs 6, 4 vs 5 in Wild Card
export const WILD_CARD_MATCHUPS = [
  { home: 2, away: 7, gameId: 'game1' },
  { home: 3, away: 6, gameId: 'game2' },
  { home: 4, away: 5, gameId: 'game3' },
];

// After Wild Card: 1 seed plays lowest remaining, higher seeds host
export const getTeamBySeed = (teams, seed) => {
  return teams.find(t => t.seed === seed);
};
