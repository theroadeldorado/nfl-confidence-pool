import React from 'react';

export const TeamBadge = ({
  team,
  points,
  isWinner = false,
  isEliminated = false,
  showSeed = true,
  size = 'md',
}) => {
  const sizes = {
    sm: 'text-sm p-2',
    md: 'text-base p-3',
    lg: 'text-lg p-4',
  };

  return (
    <div
      className={`
        ${sizes[size]}
        rounded-lg flex items-center justify-between
        ${isEliminated ? 'bg-gray-100 text-gray-400 line-through' : 'bg-white'}
        ${isWinner ? 'ring-2 ring-green-500 bg-green-50' : ''}
      `}
    >
      <div className="flex items-center gap-2">
        {showSeed && (
          <span className="text-gray-400 text-xs font-medium">
            #{team.seed}
          </span>
        )}
        <span className={`font-medium ${isEliminated ? 'text-gray-400' : ''}`}>
          {team.name}
        </span>
      </div>
      {points !== undefined && (
        <span
          className={`
            inline-flex items-center justify-center
            w-8 h-8 rounded-full font-bold text-sm
            ${points >= 12 ? 'bg-green-500 text-white' :
              points >= 8 ? 'bg-green-200 text-green-800' :
              points >= 4 ? 'bg-gray-200 text-gray-700' :
              'bg-gray-100 text-gray-500'}
          `}
        >
          {points}
        </span>
      )}
    </div>
  );
};
