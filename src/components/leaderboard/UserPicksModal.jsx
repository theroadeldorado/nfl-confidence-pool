import React from 'react';
import { Modal } from '../common/Modal';
import { getAllWinners } from '../../utils/scoring';

export const UserPicksModal = ({ isOpen, onClose, entry, teams, results }) => {
  if (!entry) return null;

  const winners = getAllWinners(results);
  const allTeams = [...(teams?.afc || []), ...(teams?.nfc || [])];

  // Sort picks by points (highest first)
  const sortedPicks = Object.entries(entry.rankings || {})
    .sort((a, b) => b[1] - a[1])
    .map(([teamName, points]) => {
      const team = allTeams.find(t => t.name === teamName);
      const hasWon = winners.includes(teamName);
      const isEliminated = team?.eliminated;
      return { teamName, points, hasWon, isEliminated, team };
    });

  const earnedPoints = sortedPicks
    .filter(p => p.hasWon)
    .reduce((sum, p) => sum + p.points, 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${entry.name}'s Picks`}>
      <div className="mb-4 p-4 bg-green-50 rounded-lg">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{entry.score}</div>
          <div className="text-sm text-green-700">Points Earned</div>
        </div>
      </div>

      <div className="space-y-2">
        {sortedPicks.map(({ teamName, points, hasWon, isEliminated, team }) => (
          <div
            key={teamName}
            className={`
              flex items-center justify-between p-3 rounded-lg border-l-4
              ${hasWon ? 'bg-green-50 border-green-500' :
                isEliminated ? 'bg-gray-100 border-gray-300 text-gray-400' :
                'bg-white border-gray-200'}
            `}
          >
            <div className="flex items-center gap-2">
              {hasWon && <span className="text-green-500">&#10003;</span>}
              {isEliminated && <span className="text-gray-400">&#10007;</span>}
              <span className={`${isEliminated ? 'line-through' : ''}`}>
                {team && <span className="text-gray-400 text-xs mr-1">#{team.seed}</span>}
                {teamName}
              </span>
            </div>
            <span className={`
              inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
              ${hasWon ? 'bg-green-500 text-white' :
                points >= 12 ? 'bg-green-200 text-green-800' :
                points >= 8 ? 'bg-yellow-200 text-yellow-800' :
                points >= 4 ? 'bg-gray-200 text-gray-700' :
                'bg-gray-100 text-gray-500'}
            `}>
              {points}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
};
