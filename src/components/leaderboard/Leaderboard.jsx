import React, {
  useState,
} from "react";
import { useLeaderboard } from "../../hooks/useLeaderboard";
import {
  getTeamInfo,
  TeamLogo,
} from "../../constants/teamAbbreviations";
import { getTeamsWhoLost } from "../../utils/scoring";

const TeamBadge =
  ({
    teamName,
    points,
    isEliminated,
  }) => {
    const info =
      getTeamInfo(
        teamName
      );

    return (
      <div
        className="flex flex-col md:flex-row justify-center items-center gap-1 md:gap-2 px-2 py-1.5 rounded-lg"
        style={{
          backgroundColor:
            info.color,
          opacity:
            isEliminated
              ? 0.3
              : 1,
          scale:
            isEliminated
              ? 0.8
              : 1,
        }}
        title={`${teamName}: ${points} pts${
          isEliminated
            ? " (Eliminated)"
            : ""
        }`}
      >
        <TeamLogo
          teamName={
            teamName
          }
          size={
            32
          }
        />
        <span
          className="bg-white/30 px-2 py-0.5 rounded text-sm font-bold"
          style={{
            color:
              info.textColor,
          }}
        >
          {
            points
          }
        </span>
      </div>
    );
  };

const ExpandedPicks =
  ({
    rankings,
    teams,
    results,
  }) => {
    // Sort by points (highest first)
    const sortedPicks =
      Object.entries(
        rankings ||
          {}
      ).sort(
        (
          a,
          b
        ) =>
          b[1] -
          a[1]
      );

    // Get eliminated teams from results
    const eliminatedTeams =
      getTeamsWhoLost(
        results,
        teams
      );

    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="grid grid-cols-7 gap-2">
          {sortedPicks.map(
            ([
              teamName,
              points,
            ]) => {
              const isEliminated =
                eliminatedTeams.has(
                  teamName
                );

              return (
                <TeamBadge
                  key={
                    teamName
                  }
                  teamName={
                    teamName
                  }
                  points={
                    points
                  }
                  isEliminated={
                    isEliminated
                  }
                />
              );
            }
          )}
        </div>
      </div>
    );
  };

const LeaderboardEntry =
  ({
    entry,
    rank,
    teams,
    results,
    isExpanded,
    onToggle,
  }) => {
    const {
      name,
      score,
      maxPossible,
    } =
      entry;

    const getRankStyle =
      () => {
        if (
          rank ===
          1
        )
          return "bg-yellow-400 text-yellow-900";
        if (
          rank ===
          2
        )
          return "bg-gray-300 text-gray-800";
        if (
          rank ===
          3
        )
          return "bg-amber-600 text-white";
        return "bg-gray-100 text-gray-600";
      };

    const getRankEmoji =
      () => {
        if (
          rank ===
          1
        )
          return "🥇";
        if (
          rank ===
          2
        )
          return "🥈";
        if (
          rank ===
          3
        )
          return "🥉";
        return null;
      };

    return (
      <div
        className={`
        bg-white rounded-lg shadow-sm border transition-all cursor-pointer
        ${
          isExpanded
            ? "ring-2 ring-green-500 shadow-md"
            : "hover:shadow-md hover:border-gray-300"
        }
      `}
        onClick={
          onToggle
        }
      >
        <div className="flex items-center p-3">
          {/* Rank */}
          <div
            className={`
          w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-3 shrink-0
          ${getRankStyle()}
        `}
          >
            {getRankEmoji() ||
              rank}
          </div>

          {/* Name & potential */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate text-gray-900">
              {
                name
              }
            </div>
            <div className="text-xs text-gray-500">
              Max
              possible:{" "}
              {
                maxPossible
              }{" "}
              pts
            </div>
          </div>

          {/* Score */}
          <div className="text-right mr-2">
            <div className="text-2xl font-bold text-green-600">
              {
                score
              }
            </div>
            <div className="text-xs text-gray-500">
              points
            </div>
          </div>

          {/* Expand indicator */}
          <div
            className={`text-gray-400 transition-transform ${
              isExpanded
                ? "rotate-180"
                : ""
            }`}
          >
            ▼
          </div>
        </div>

        {/* Expanded picks */}
        {isExpanded && (
          <div className="px-3 pb-3">
            <ExpandedPicks
              rankings={
                entry.rankings
              }
              teams={
                teams
              }
              results={
                results
              }
            />
          </div>
        )}
      </div>
    );
  };

export const Leaderboard =
  ({
    entries,
    results,
    teams,
  }) => {
    const leaderboard =
      useLeaderboard(
        entries,
        results,
        teams
      );
    const [
      expandedEntry,
      setExpandedEntry,
    ] =
      useState(
        null
      );

    if (
      leaderboard.length ===
      0
    ) {
      return (
        <div className="text-center py-8 text-gray-500">
          No
          entries
          yet.
          Be
          the
          first
          to
          submit!
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {leaderboard.map(
          (
            entry,
            index
          ) => (
            <LeaderboardEntry
              key={
                entry.name
              }
              entry={
                entry
              }
              rank={
                entry.rank
              }
              teams={
                teams
              }
              results={
                results
              }
              isExpanded={
                expandedEntry ===
                entry.name
              }
              onToggle={() =>
                setExpandedEntry(
                  expandedEntry ===
                    entry.name
                    ? null
                    : entry.name
                )
              }
            />
          )
        )}
      </div>
    );
  };
