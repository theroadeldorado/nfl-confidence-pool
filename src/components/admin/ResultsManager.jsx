import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, update, get } from 'firebase/database';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { calculateScore } from '../../utils/scoring';
import { ROUNDS } from '../../constants/rounds';
import { getTeamInfo, TeamLogo } from '../../constants/teamAbbreviations';

export const ResultsManager = ({ poolId }) => {
  const [teams, setTeams] = useState({ afc: [], nfc: [] });
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!poolId) {
      setLoading(false);
      return;
    }

    const poolRef = ref(database, `pools/${poolId}`);
    const unsubscribe = onValue(poolRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTeams(data.teams || { afc: [], nfc: [] });
        setResults(data.results || {});
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [poolId]);

  const getTeamBySeed = (conference, seed) => {
    return teams[conference]?.find(t => t.seed === seed);
  };

  const getWinner = (round, conference, gameId) => {
    if (conference) {
      return results[round]?.[conference]?.[gameId]?.winner;
    }
    return results[round]?.winner;
  };

  const handleWinnerChange = (round, conference, gameId, winner) => {
    setResults(prev => {
      const newResults = { ...prev };
      if (!newResults[round]) newResults[round] = {};

      if (conference) {
        if (!newResults[round][conference]) newResults[round][conference] = {};
        newResults[round][conference][gameId] = {
          winner: winner || null,
          completedAt: winner ? new Date().toISOString() : null,
        };
      } else {
        newResults[round] = {
          winner: winner || null,
          completedAt: winner ? new Date().toISOString() : null,
        };
      }
      return newResults;
    });
  };

  const handleSave = async () => {
    if (!poolId) return;
    setSaving(true);
    try {
      await update(ref(database, `pools/${poolId}`), { results });

      const entriesRef = ref(database, `entries/${poolId}`);
      const entriesSnapshot = await get(entriesRef);
      const entries = entriesSnapshot.val() || {};

      const updates = {};
      for (const [username, entry] of Object.entries(entries)) {
        const score = calculateScore(entry.rankings, results);
        updates[`entries/${poolId}/${username}/score`] = score;
      }

      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates);
      }
    } catch (error) {
      console.error('Error saving results:', error);
    }
    setSaving(false);
  };

  // Get Wild Card matchups based on seeds
  const getWildCardMatchups = (conference) => [
    { id: 'wc_2v7', highSeed: 2, lowSeed: 7 },
    { id: 'wc_3v6', highSeed: 3, lowSeed: 6 },
    { id: 'wc_4v5', highSeed: 4, lowSeed: 5 },
  ];

  // Get Divisional matchups (reseeded based on Wild Card results)
  const getDivisionalMatchups = (conference) => {
    const seed1 = getTeamBySeed(conference, 1);
    const wcWinners = [];

    // Get wild card winners
    const wc2v7 = getWinner(ROUNDS.WILD_CARD, conference, 'wc_2v7');
    const wc3v6 = getWinner(ROUNDS.WILD_CARD, conference, 'wc_3v6');
    const wc4v5 = getWinner(ROUNDS.WILD_CARD, conference, 'wc_4v5');

    if (wc2v7) wcWinners.push({ name: wc2v7, seed: wc2v7 === getTeamBySeed(conference, 2)?.name ? 2 : 7 });
    if (wc3v6) wcWinners.push({ name: wc3v6, seed: wc3v6 === getTeamBySeed(conference, 3)?.name ? 3 : 6 });
    if (wc4v5) wcWinners.push({ name: wc4v5, seed: wc4v5 === getTeamBySeed(conference, 4)?.name ? 4 : 5 });

    // Sort by seed (lowest seed number = highest seed)
    wcWinners.sort((a, b) => a.seed - b.seed);

    // #1 plays lowest remaining seed, other two play each other
    return [
      {
        id: 'div_1vLowest',
        label: '#1 vs Lowest Seed',
        team1: seed1?.name,
        team2: wcWinners[2]?.name, // Lowest remaining (highest seed number)
      },
      {
        id: 'div_middle',
        label: 'Other Matchup',
        team1: wcWinners[0]?.name, // Highest remaining
        team2: wcWinners[1]?.name, // Middle remaining
      },
    ];
  };

  // Get Conference Championship matchup
  const getConferenceMatchup = (conference) => {
    const div1 = getWinner(ROUNDS.DIVISIONAL, conference, 'div_1vLowest');
    const div2 = getWinner(ROUNDS.DIVISIONAL, conference, 'div_middle');

    return {
      id: 'championship',
      team1: div1,
      team2: div2,
    };
  };

  // Get Super Bowl matchup
  const getSuperBowlMatchup = () => {
    const afcChamp = getWinner(ROUNDS.CONFERENCE, 'afc', 'championship');
    const nfcChamp = getWinner(ROUNDS.CONFERENCE, 'nfc', 'championship');

    return {
      id: 'superBowl',
      team1: afcChamp,
      team2: nfcChamp,
      team1Conf: 'AFC',
      team2Conf: 'NFC',
    };
  };

  if (!poolId) {
    return (
      <Card>
        <p className="text-gray-500 text-center py-8">
          Please select a pool from the Pools tab first.
        </p>
      </Card>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Loading results...</div>;
  }

  const TeamButton = ({ team, isSelected, onClick, conference }) => {
    if (!team) {
      return (
        <div className="flex-1 p-3 bg-gray-100 rounded text-gray-400 text-center text-sm">
          TBD
        </div>
      );
    }

    const info = getTeamInfo(team);
    const confColor = conference === 'afc' ? 'ring-red-500' : conference === 'nfc' ? 'ring-blue-500' : 'ring-yellow-500';

    return (
      <button
        onClick={onClick}
        className={`
          flex-1 p-2 rounded font-bold text-sm transition-all flex items-center justify-center gap-2
          ${isSelected
            ? `ring-4 ${confColor} shadow-lg scale-105`
            : 'hover:scale-102 hover:shadow-md opacity-80 hover:opacity-100'}
        `}
        style={{
          backgroundColor: info.color,
          color: info.textColor,
        }}
      >
        <TeamLogo teamName={team} size={28} />
        <span>{info.abbr}</span>
        {isSelected && <span>✓</span>}
      </button>
    );
  };

  const MatchupRow = ({ matchup, round, conference, label }) => {
    const currentWinner = getWinner(round, conference, matchup.id);
    const team1 = matchup.team1 || getTeamBySeed(conference, matchup.highSeed)?.name;
    const team2 = matchup.team2 || getTeamBySeed(conference, matchup.lowSeed)?.name;

    const seedLabel = matchup.highSeed && matchup.lowSeed
      ? `#${matchup.highSeed} vs #${matchup.lowSeed}`
      : label || matchup.label;

    return (
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="text-xs text-gray-500 mb-2 font-semibold">{seedLabel}</div>
        <div className="flex gap-2 items-center">
          <TeamButton
            team={team1}
            isSelected={currentWinner === team1}
            onClick={() => handleWinnerChange(round, conference, matchup.id, currentWinner === team1 ? '' : team1)}
            conference={conference}
          />
          <span className="text-gray-400 font-bold text-xs">VS</span>
          <TeamButton
            team={team2}
            isSelected={currentWinner === team2}
            onClick={() => handleWinnerChange(round, conference, matchup.id, currentWinner === team2 ? '' : team2)}
            conference={conference}
          />
        </div>
      </div>
    );
  };

  const renderConferenceResults = (conference, title, borderColor, textColor) => {
    const wcMatchups = getWildCardMatchups(conference);
    const divMatchups = getDivisionalMatchups(conference);
    const confMatchup = getConferenceMatchup(conference);

    return (
      <Card>
        <h3 className={`font-bold text-lg mb-4 ${textColor}`}>{title}</h3>

        {/* 1 Seed Bye */}
        <div className="mb-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
          <div className="text-xs text-gray-500 mb-1">#1 SEED - First Round Bye</div>
          <div className="font-bold text-green-700">
            {getTeamBySeed(conference, 1)?.name || 'TBD'}
          </div>
        </div>

        {/* Wild Card */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">Wild Card Round</h4>
          <div className="space-y-2">
            {wcMatchups.map(matchup => (
              <MatchupRow
                key={matchup.id}
                matchup={matchup}
                round={ROUNDS.WILD_CARD}
                conference={conference}
              />
            ))}
          </div>
        </div>

        {/* Divisional */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">Divisional Round</h4>
          <div className="space-y-2">
            {divMatchups.map(matchup => (
              <MatchupRow
                key={matchup.id}
                matchup={matchup}
                round={ROUNDS.DIVISIONAL}
                conference={conference}
                label={matchup.label}
              />
            ))}
          </div>
        </div>

        {/* Conference Championship */}
        <div>
          <h4 className="text-sm font-semibold text-gray-600 mb-2 border-b pb-1">
            {conference.toUpperCase()} Championship
          </h4>
          <MatchupRow
            matchup={confMatchup}
            round={ROUNDS.CONFERENCE}
            conference={conference}
            label="Conference Final"
          />
        </div>
      </Card>
    );
  };

  const superBowlMatchup = getSuperBowlMatchup();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {renderConferenceResults('afc', 'AFC Bracket', 'border-red-500', 'text-red-700')}
        {renderConferenceResults('nfc', 'NFC Bracket', 'border-blue-500', 'text-blue-700')}
      </div>

      {/* Super Bowl */}
      <Card>
        <h3 className="font-bold text-lg mb-4 text-yellow-700 text-center">
          🏆 Super Bowl LX
        </h3>
        <div className="max-w-md mx-auto">
          <div className="bg-gradient-to-r from-red-50 via-yellow-50 to-blue-50 p-4 rounded-lg">
            <div className="flex gap-3 items-center justify-center">
              <div className="flex-1 text-center">
                <div className="text-xs text-red-600 font-semibold mb-1">AFC Champion</div>
                <TeamButton
                  team={superBowlMatchup.team1}
                  isSelected={getWinner(ROUNDS.SUPER_BOWL, null, 'superBowl') === superBowlMatchup.team1}
                  onClick={() => handleWinnerChange(ROUNDS.SUPER_BOWL, null, 'superBowl',
                    getWinner(ROUNDS.SUPER_BOWL, null, 'superBowl') === superBowlMatchup.team1 ? '' : superBowlMatchup.team1)}
                  conference="afc"
                />
              </div>
              <span className="text-yellow-600 font-bold text-lg">VS</span>
              <div className="flex-1 text-center">
                <div className="text-xs text-blue-600 font-semibold mb-1">NFC Champion</div>
                <TeamButton
                  team={superBowlMatchup.team2}
                  isSelected={getWinner(ROUNDS.SUPER_BOWL, null, 'superBowl') === superBowlMatchup.team2}
                  onClick={() => handleWinnerChange(ROUNDS.SUPER_BOWL, null, 'superBowl',
                    getWinner(ROUNDS.SUPER_BOWL, null, 'superBowl') === superBowlMatchup.team2 ? '' : superBowlMatchup.team2)}
                  conference="nfc"
                />
              </div>
            </div>
            {getWinner(ROUNDS.SUPER_BOWL, null, 'superBowl') && (
              <div className="mt-4 text-center">
                <span className="text-2xl">🎉</span>
                <div className="font-bold text-yellow-700 text-lg">
                  {getWinner(ROUNDS.SUPER_BOWL, null, 'superBowl')} are Super Bowl Champions!
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving & Recalculating Scores...' : 'Save Results'}
        </Button>
      </div>
    </div>
  );
};
