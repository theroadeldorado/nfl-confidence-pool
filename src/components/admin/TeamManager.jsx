import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, update } from 'firebase/database';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { TeamLogo } from '../../constants/teamAbbreviations';

export const TeamManager = ({ poolId }) => {
  const [teams, setTeams] = useState({ afc: [], nfc: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!poolId) {
      setLoading(false);
      return;
    }

    const teamsRef = ref(database, `pools/${poolId}/teams`);
    const unsubscribe = onValue(teamsRef, (snapshot) => {
      setTeams(snapshot.val() || { afc: [], nfc: [] });
      setLoading(false);
    });
    return () => unsubscribe();
  }, [poolId]);

  const getTeamBySeed = (conference, seed) => {
    return teams[conference]?.find(t => t.seed === seed) || { seed, name: '', record: '', eliminated: false };
  };

  const handleTeamChange = (conference, seed, field, value) => {
    setTeams(prev => {
      const conferenceTeams = [...(prev[conference] || [])];
      const existingIndex = conferenceTeams.findIndex(t => t.seed === seed);

      if (existingIndex >= 0) {
        conferenceTeams[existingIndex] = {
          ...conferenceTeams[existingIndex],
          [field]: value
        };
      } else {
        conferenceTeams.push({ seed, name: '', record: '', eliminated: false, [field]: value });
      }

      // Sort by seed
      conferenceTeams.sort((a, b) => a.seed - b.seed);

      return { ...prev, [conference]: conferenceTeams };
    });
  };

  const handleSave = async () => {
    if (!poolId) return;
    setSaving(true);
    try {
      await update(ref(database, `pools/${poolId}`), { teams });
    } catch (error) {
      console.error('Error saving teams:', error);
    }
    setSaving(false);
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
    return <div className="text-center py-8">Loading teams...</div>;
  }

  const TeamInput = ({ conference, seed, label }) => {
    const team = getTeamBySeed(conference, seed);
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 w-8 text-center font-bold">#{seed}</span>
        <TeamLogo teamName={team.name} size={32} />
        <input
          type="text"
          value={team.name}
          onChange={(e) => handleTeamChange(conference, seed, 'name', e.target.value)}
          className="flex-1 p-2 border rounded"
          placeholder={label}
        />
        <input
          type="text"
          value={team.record}
          onChange={(e) => handleTeamChange(conference, seed, 'record', e.target.value)}
          className="w-20 p-2 border rounded text-center"
          placeholder="0-0"
        />
        <label className="flex items-center gap-1 text-sm text-gray-500 w-12">
          <input
            type="checkbox"
            checked={team.eliminated}
            onChange={(e) => handleTeamChange(conference, seed, 'eliminated', e.target.checked)}
          />
          Out
        </label>
      </div>
    );
  };

  const MatchupCard = ({ conference, highSeed, lowSeed, title, color }) => {
    const highTeam = getTeamBySeed(conference, highSeed);
    const lowTeam = getTeamBySeed(conference, lowSeed);

    return (
      <div className={`border-l-4 ${color} bg-gray-50 p-3 rounded-r`}>
        <div className="text-xs text-gray-500 mb-2 font-semibold">{title}</div>
        <div className="space-y-2">
          <TeamInput conference={conference} seed={highSeed} label={`#${highSeed} Seed`} />
          <div className="text-center text-gray-400 text-sm font-bold">vs</div>
          <TeamInput conference={conference} seed={lowSeed} label={`#${lowSeed} Seed`} />
        </div>
      </div>
    );
  };

  const ByeCard = ({ conference, seed, title, color }) => {
    return (
      <div className={`border-l-4 ${color} bg-gray-50 p-3 rounded-r`}>
        <div className="text-xs text-gray-500 mb-2 font-semibold">{title}</div>
        <TeamInput conference={conference} seed={seed} label={`#${seed} Seed`} />
        <div className="text-center text-green-600 text-sm mt-2 font-medium">
          🏆 First Round Bye
        </div>
      </div>
    );
  };

  const renderConferenceBracket = (conference, title, borderColor, textColor) => (
    <Card>
      <h3 className={`font-bold mb-4 text-lg ${textColor}`}>{title}</h3>

      <div className="space-y-4">
        {/* 1 Seed - Bye */}
        <ByeCard
          conference={conference}
          seed={1}
          title={`${conference.toUpperCase()} #1 SEED`}
          color={borderColor}
        />

        {/* Wild Card Matchups */}
        <div className="pt-2 border-t">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">Wild Card Round</h4>
          <div className="space-y-4">
            <MatchupCard
              conference={conference}
              highSeed={2}
              lowSeed={7}
              title={`${conference.toUpperCase()} #2 vs #7`}
              color={borderColor}
            />
            <MatchupCard
              conference={conference}
              highSeed={3}
              lowSeed={6}
              title={`${conference.toUpperCase()} #3 vs #6`}
              color={borderColor}
            />
            <MatchupCard
              conference={conference}
              highSeed={4}
              lowSeed={5}
              title={`${conference.toUpperCase()} #4 vs #5`}
              color={borderColor}
            />
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {renderConferenceBracket('afc', 'AFC Playoff Bracket', 'border-red-500', 'text-red-700')}
        {renderConferenceBracket('nfc', 'NFC Playoff Bracket', 'border-blue-500', 'text-blue-700')}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save Teams'}
        </Button>
      </div>
    </div>
  );
};
