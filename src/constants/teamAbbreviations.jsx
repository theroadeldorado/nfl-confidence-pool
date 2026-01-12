// NFL Team abbreviations, colors, and logos
// Logo URLs from ESPN CDN
const ESPN_LOGO_BASE = 'https://a.espncdn.com/i/teamlogos/nfl/500/';

export const TEAM_INFO = {
  // AFC Teams
  'Denver Broncos': { abbr: 'DEN', color: '#FB4F14', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}den.png` },
  'New England Patriots': { abbr: 'NE', color: '#002244', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}ne.png` },
  'Jacksonville Jaguars': { abbr: 'JAX', color: '#006778', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}jax.png` },
  'Pittsburgh Steelers': { abbr: 'PIT', color: '#FFB612', textColor: '#000000', logo: `${ESPN_LOGO_BASE}pit.png` },
  'Houston Texans': { abbr: 'HOU', color: '#03202F', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}hou.png` },
  'Buffalo Bills': { abbr: 'BUF', color: '#00338D', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}buf.png` },
  'Los Angeles Chargers': { abbr: 'LAC', color: '#0080C6', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}lac.png` },
  'Kansas City Chiefs': { abbr: 'KC', color: '#E31837', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}kc.png` },
  'Baltimore Ravens': { abbr: 'BAL', color: '#241773', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}bal.png` },
  'Cincinnati Bengals': { abbr: 'CIN', color: '#FB4F14', textColor: '#000000', logo: `${ESPN_LOGO_BASE}cin.png` },
  'Miami Dolphins': { abbr: 'MIA', color: '#008E97', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}mia.png` },
  'Cleveland Browns': { abbr: 'CLE', color: '#311D00', textColor: '#FF3C00', logo: `${ESPN_LOGO_BASE}cle.png` },
  'Las Vegas Raiders': { abbr: 'LV', color: '#000000', textColor: '#A5ACAF', logo: `${ESPN_LOGO_BASE}lv.png` },
  'New York Jets': { abbr: 'NYJ', color: '#125740', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}nyj.png` },
  'Tennessee Titans': { abbr: 'TEN', color: '#0C2340', textColor: '#4B92DB', logo: `${ESPN_LOGO_BASE}ten.png` },
  'Indianapolis Colts': { abbr: 'IND', color: '#002C5F', textColor: '#FFFFFF', logo: `${ESPN_LOGO_BASE}ind.png` },

  // NFC Teams
  'Seattle Seahawks': { abbr: 'SEA', color: '#002244', textColor: '#69BE28', logo: `${ESPN_LOGO_BASE}sea.png` },
  'Chicago Bears': { abbr: 'CHI', color: '#0B162A', textColor: '#C83803', logo: `${ESPN_LOGO_BASE}chi.png` },
  'Philadelphia Eagles': { abbr: 'PHI', color: '#004C54', textColor: '#A5ACAF', logo: `${ESPN_LOGO_BASE}phi.png` },
  'Carolina Panthers': { abbr: 'CAR', color: '#0085CA', textColor: '#000000', logo: `${ESPN_LOGO_BASE}car.png` },
  'Los Angeles Rams': { abbr: 'LAR', color: '#003594', textColor: '#FFD100', logo: `${ESPN_LOGO_BASE}lar.png` },
  'San Francisco 49ers': { abbr: 'SF', color: '#AA0000', textColor: '#B3995D', logo: `${ESPN_LOGO_BASE}sf.png` },
  'Green Bay Packers': { abbr: 'GB', color: '#203731', textColor: '#FFB612', logo: `${ESPN_LOGO_BASE}gb.png` },
  'Detroit Lions': { abbr: 'DET', color: '#0076B6', textColor: '#B0B7BC', logo: `${ESPN_LOGO_BASE}det.png` },
  'Minnesota Vikings': { abbr: 'MIN', color: '#4F2683', textColor: '#FFC62F', logo: `${ESPN_LOGO_BASE}min.png` },
  'Dallas Cowboys': { abbr: 'DAL', color: '#003594', textColor: '#869397', logo: `${ESPN_LOGO_BASE}dal.png` },
  'New York Giants': { abbr: 'NYG', color: '#0B2265', textColor: '#A71930', logo: `${ESPN_LOGO_BASE}nyg.png` },
  'Washington Commanders': { abbr: 'WAS', color: '#5A1414', textColor: '#FFB612', logo: `${ESPN_LOGO_BASE}wsh.png` },
  'Tampa Bay Buccaneers': { abbr: 'TB', color: '#D50A0A', textColor: '#FF7900', logo: `${ESPN_LOGO_BASE}tb.png` },
  'New Orleans Saints': { abbr: 'NO', color: '#D3BC8D', textColor: '#000000', logo: `${ESPN_LOGO_BASE}no.png` },
  'Atlanta Falcons': { abbr: 'ATL', color: '#A71930', textColor: '#000000', logo: `${ESPN_LOGO_BASE}atl.png` },
  'Arizona Cardinals': { abbr: 'ARI', color: '#97233F', textColor: '#000000', logo: `${ESPN_LOGO_BASE}ari.png` },
};

export const getTeamInfo = (teamName) => {
  return TEAM_INFO[teamName] || {
    abbr: teamName?.substring(0, 3).toUpperCase() || '???',
    color: '#666666',
    textColor: '#FFFFFF',
    logo: null
  };
};

export const getTeamAbbr = (teamName) => {
  return getTeamInfo(teamName).abbr;
};

export const getTeamLogo = (teamName) => {
  return getTeamInfo(teamName).logo;
};

// Team logo component
export const TeamLogo = ({ teamName, size = 32, className = '' }) => {
  const info = getTeamInfo(teamName);

  if (!info.logo) {
    return (
      <div
        className={`flex items-center justify-center rounded-full font-bold text-xs ${className}`}
        style={{
          width: size,
          height: size,
          backgroundColor: info.color,
          color: info.textColor
        }}
      >
        {info.abbr}
      </div>
    );
  }

  return (
    <img
      src={info.logo}
      alt={teamName}
      title={teamName}
      className={className}
      style={{ width: size, height: size, objectFit: 'contain' }}
    />
  );
};
