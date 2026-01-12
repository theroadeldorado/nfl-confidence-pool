import React from 'react';
import { BracketMatchup } from './BracketMatchup';

export const BracketRound = ({
  title,
  matchups,
  results,
  conference,
  isSuperbowl = false,
}) => {
  return (
    <div className="flex flex-col">
      <h3 className={`
        text-xs font-bold text-center mb-2 uppercase tracking-wide
        ${conference === 'afc' ? 'text-red-600' : conference === 'nfc' ? 'text-blue-600' : 'text-yellow-600'}
      `}>
        {title}
      </h3>
      <div className="flex flex-col justify-around flex-1 gap-4">
        {matchups.map((matchup, index) => (
          <BracketMatchup
            key={matchup.gameId || index}
            homeTeam={matchup.homeTeam}
            awayTeam={matchup.awayTeam}
            winner={results?.[matchup.gameId]?.winner}
            isSuperbowl={isSuperbowl}
          />
        ))}
      </div>
    </div>
  );
};
