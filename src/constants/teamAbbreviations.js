// NFL Team abbreviations and colors
export const TEAM_INFO = {
  // AFC Teams
  'Denver Broncos': { abbr: 'DEN', color: '#FB4F14', textColor: '#FFFFFF' },
  'New England Patriots': { abbr: 'NE', color: '#002244', textColor: '#FFFFFF' },
  'Jacksonville Jaguars': { abbr: 'JAX', color: '#006778', textColor: '#FFFFFF' },
  'Pittsburgh Steelers': { abbr: 'PIT', color: '#FFB612', textColor: '#000000' },
  'Houston Texans': { abbr: 'HOU', color: '#03202F', textColor: '#FFFFFF' },
  'Buffalo Bills': { abbr: 'BUF', color: '#00338D', textColor: '#FFFFFF' },
  'Los Angeles Chargers': { abbr: 'LAC', color: '#0080C6', textColor: '#FFFFFF' },
  'Kansas City Chiefs': { abbr: 'KC', color: '#E31837', textColor: '#FFFFFF' },
  'Baltimore Ravens': { abbr: 'BAL', color: '#241773', textColor: '#FFFFFF' },
  'Cincinnati Bengals': { abbr: 'CIN', color: '#FB4F14', textColor: '#000000' },
  'Miami Dolphins': { abbr: 'MIA', color: '#008E97', textColor: '#FFFFFF' },
  'Cleveland Browns': { abbr: 'CLE', color: '#311D00', textColor: '#FF3C00' },
  'Las Vegas Raiders': { abbr: 'LV', color: '#000000', textColor: '#A5ACAF' },
  'New York Jets': { abbr: 'NYJ', color: '#125740', textColor: '#FFFFFF' },
  'Tennessee Titans': { abbr: 'TEN', color: '#0C2340', textColor: '#4B92DB' },
  'Indianapolis Colts': { abbr: 'IND', color: '#002C5F', textColor: '#FFFFFF' },

  // NFC Teams
  'Seattle Seahawks': { abbr: 'SEA', color: '#002244', textColor: '#69BE28' },
  'Chicago Bears': { abbr: 'CHI', color: '#0B162A', textColor: '#C83803' },
  'Philadelphia Eagles': { abbr: 'PHI', color: '#004C54', textColor: '#A5ACAF' },
  'Carolina Panthers': { abbr: 'CAR', color: '#0085CA', textColor: '#000000' },
  'Los Angeles Rams': { abbr: 'LAR', color: '#003594', textColor: '#FFD100' },
  'San Francisco 49ers': { abbr: 'SF', color: '#AA0000', textColor: '#B3995D' },
  'Green Bay Packers': { abbr: 'GB', color: '#203731', textColor: '#FFB612' },
  'Detroit Lions': { abbr: 'DET', color: '#0076B6', textColor: '#B0B7BC' },
  'Minnesota Vikings': { abbr: 'MIN', color: '#4F2683', textColor: '#FFC62F' },
  'Dallas Cowboys': { abbr: 'DAL', color: '#003594', textColor: '#869397' },
  'New York Giants': { abbr: 'NYG', color: '#0B2265', textColor: '#A71930' },
  'Washington Commanders': { abbr: 'WAS', color: '#5A1414', textColor: '#FFB612' },
  'Tampa Bay Buccaneers': { abbr: 'TB', color: '#D50A0A', textColor: '#FF7900' },
  'New Orleans Saints': { abbr: 'NO', color: '#D3BC8D', textColor: '#000000' },
  'Atlanta Falcons': { abbr: 'ATL', color: '#A71930', textColor: '#000000' },
  'Arizona Cardinals': { abbr: 'ARI', color: '#97233F', textColor: '#000000' },
};

export const getTeamInfo = (teamName) => {
  return TEAM_INFO[teamName] || { abbr: teamName.substring(0, 3).toUpperCase(), color: '#666666', textColor: '#FFFFFF' };
};

export const getTeamAbbr = (teamName) => {
  return getTeamInfo(teamName).abbr;
};
