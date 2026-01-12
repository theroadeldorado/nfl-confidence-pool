import React from 'react';

export const BracketMatchup = ({
  homeTeam,
  awayTeam,
  winner,
  isSuperbowl = false,
  showSeeds = true,
}) => {
  const getTeamStyle = (team) => {
    if (!team) return 'bg-gray-100 text-gray-400';
    if (winner === team.name) return 'bg-green-100 border-green-500 text-green-800 font-bold';
    if (winner && winner !== team.name) return 'bg-gray-100 text-gray-400 line-through';
    return 'bg-white';
  };

  const TeamSlot = ({ team, isHome }) => (
    <div
      className={`
        px-3 py-2 border-l-4 rounded-r
        ${team ? getTeamStyle(team) : 'bg-gray-50 border-gray-200'}
        ${team && winner === team.name ? 'border-green-500' : 'border-gray-300'}
      `}
    >
      {team ? (
        <div className="flex items-center justify-between">
          <span className="truncate">
            {showSeeds && <span className="text-gray-400 text-xs mr-1">#{team.seed}</span>}
            {team.name}
          </span>
        </div>
      ) : (
        <span className="text-gray-400 italic">TBD</span>
      )}
    </div>
  );

  return (
    <div className={`
      bg-gray-50 rounded-lg overflow-hidden shadow-sm
      ${isSuperbowl ? 'ring-2 ring-yellow-400' : ''}
    `}>
      {isSuperbowl && (
        <div className="bg-yellow-400 text-yellow-900 text-xs font-bold text-center py-1">
          SUPER BOWL
        </div>
      )}
      <div className="space-y-1 p-2">
        <TeamSlot team={homeTeam} isHome={true} />
        <TeamSlot team={awayTeam} isHome={false} />
      </div>
    </div>
  );
};
