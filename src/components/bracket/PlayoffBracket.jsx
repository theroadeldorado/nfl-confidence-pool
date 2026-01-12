import React from 'react';
import { BracketRound } from './BracketRound';
import { getWildCardMatchups, getDivisionalMatchups, getConferenceMatchup, getSuperBowlMatchup } from '../../utils/bracket';
import { ROUND_NAMES, ROUNDS } from '../../constants/rounds';

export const PlayoffBracket = ({ teams, results }) => {
  const afcTeams = teams?.afc || [];
  const nfcTeams = teams?.nfc || [];

  // Calculate matchups for each round
  const afcWildCard = getWildCardMatchups(afcTeams);
  const nfcWildCard = getWildCardMatchups(nfcTeams);

  const afcDivisional = getDivisionalMatchups(afcTeams, results?.wildCard?.afc) || [
    { gameId: 'game1', homeTeam: afcTeams.find(t => t.seed === 1), awayTeam: null },
    { gameId: 'game2', homeTeam: null, awayTeam: null },
  ];
  const nfcDivisional = getDivisionalMatchups(nfcTeams, results?.wildCard?.nfc) || [
    { gameId: 'game1', homeTeam: nfcTeams.find(t => t.seed === 1), awayTeam: null },
    { gameId: 'game2', homeTeam: null, awayTeam: null },
  ];

  const afcChampionship = getConferenceMatchup(afcTeams, results?.divisional?.afc);
  const nfcChampionship = getConferenceMatchup(nfcTeams, results?.divisional?.nfc);

  const superBowl = getSuperBowlMatchup(afcTeams, nfcTeams, results?.conference);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="min-w-[900px] grid grid-cols-7 gap-2 p-4">
        {/* AFC Wild Card */}
        <BracketRound
          title="AFC Wild Card"
          matchups={afcWildCard}
          results={results?.wildCard?.afc}
          conference="afc"
        />

        {/* AFC Divisional */}
        <BracketRound
          title="AFC Divisional"
          matchups={afcDivisional}
          results={results?.divisional?.afc}
          conference="afc"
        />

        {/* AFC Championship */}
        <BracketRound
          title="AFC Championship"
          matchups={afcChampionship ? [afcChampionship] : [{ gameId: 'championship', homeTeam: null, awayTeam: null }]}
          results={results?.conference?.afc ? { championship: results.conference.afc } : {}}
          conference="afc"
        />

        {/* Super Bowl */}
        <BracketRound
          title="Super Bowl"
          matchups={superBowl ? [{
            gameId: 'superBowl',
            homeTeam: superBowl.afcTeam,
            awayTeam: superBowl.nfcTeam,
          }] : [{ gameId: 'superBowl', homeTeam: null, awayTeam: null }]}
          results={results?.superBowl ? { superBowl: results.superBowl } : {}}
          isSuperbowl={true}
        />

        {/* NFC Championship */}
        <BracketRound
          title="NFC Championship"
          matchups={nfcChampionship ? [nfcChampionship] : [{ gameId: 'championship', homeTeam: null, awayTeam: null }]}
          results={results?.conference?.nfc ? { championship: results.conference.nfc } : {}}
          conference="nfc"
        />

        {/* NFC Divisional */}
        <BracketRound
          title="NFC Divisional"
          matchups={nfcDivisional}
          results={results?.divisional?.nfc}
          conference="nfc"
        />

        {/* NFC Wild Card */}
        <BracketRound
          title="NFC Wild Card"
          matchups={nfcWildCard}
          results={results?.wildCard?.nfc}
          conference="nfc"
        />
      </div>
    </div>
  );
};
