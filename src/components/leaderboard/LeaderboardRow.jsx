import React from 'react';

export const LeaderboardRow = ({
  entry,
  isCurrentUser = false,
  onClick,
}) => {
  const { rank, name, score, potential, maxPossible } = entry;

  const getRankStyle = () => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-gray-300 text-gray-800';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center p-3 rounded-lg cursor-pointer transition
        ${isCurrentUser ? 'bg-green-50 ring-2 ring-green-500' : 'bg-white hover:bg-gray-50'}
      `}
    >
      <div className={`
        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-3
        ${getRankStyle()}
      `}>
        {rank}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{name}</div>
        <div className="text-xs text-gray-500">
          Potential: {maxPossible} pts
        </div>
      </div>

      <div className="text-right">
        <div className="text-2xl font-bold text-green-600">{score}</div>
        <div className="text-xs text-gray-500">points</div>
      </div>
    </div>
  );
};
