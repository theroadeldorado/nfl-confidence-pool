import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, push, set, update } from 'firebase/database';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { DEFAULT_AFC_TEAMS, DEFAULT_NFC_TEAMS } from '../../constants/defaultTeams';

const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const PoolManager = ({ selectedPoolId, onSelectPool }) => {
  const [pools, setPools] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolSeason, setNewPoolSeason] = useState(new Date().getFullYear().toString());

  useEffect(() => {
    const poolsRef = ref(database, 'pools');
    const unsubscribe = onValue(poolsRef, (snapshot) => {
      setPools(snapshot.val() || {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePool = async () => {
    if (!newPoolName.trim()) return;

    setCreating(true);
    try {
      const poolsRef = ref(database, 'pools');
      const newPoolRef = push(poolsRef);
      const poolId = newPoolRef.key;
      const inviteCode = generateInviteCode();

      await set(newPoolRef, {
        name: newPoolName.trim(),
        season: newPoolSeason,
        inviteCode,
        status: 'active',
        createdAt: new Date().toISOString(),
        teams: {
          afc: DEFAULT_AFC_TEAMS,
          nfc: DEFAULT_NFC_TEAMS,
        },
        results: {},
      });

      // Save invite code lookup
      await set(ref(database, `inviteCodes/${inviteCode}`), poolId);

      setNewPoolName('');
      onSelectPool(poolId);
    } catch (error) {
      console.error('Error creating pool:', error);
    }
    setCreating(false);
  };

  const copyInviteLink = (inviteCode) => {
    const link = `${window.location.origin}/pool/${inviteCode}`;
    navigator.clipboard.writeText(link);
  };

  if (loading) {
    return <div className="text-center py-8">Loading pools...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Create Pool */}
      <Card>
        <h2 className="text-lg font-bold mb-4">Create New Pool</h2>
        <div className="flex gap-4">
          <input
            type="text"
            value={newPoolName}
            onChange={(e) => setNewPoolName(e.target.value)}
            placeholder="Pool Name (e.g., Family Pool 2026)"
            className="flex-1 p-3 border rounded-lg"
          />
          <input
            type="text"
            value={newPoolSeason}
            onChange={(e) => setNewPoolSeason(e.target.value)}
            placeholder="Season"
            className="w-24 p-3 border rounded-lg"
          />
          <Button onClick={handleCreatePool} disabled={creating || !newPoolName.trim()}>
            {creating ? 'Creating...' : 'Create Pool'}
          </Button>
        </div>
      </Card>

      {/* Pool List */}
      <Card>
        <h2 className="text-lg font-bold mb-4">Your Pools</h2>
        {Object.keys(pools).length === 0 ? (
          <p className="text-gray-500">No pools yet. Create one above!</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(pools).map(([poolId, pool]) => (
              <div
                key={poolId}
                onClick={() => onSelectPool(poolId)}
                className={`
                  p-4 rounded-lg border-2 cursor-pointer transition
                  ${selectedPoolId === poolId
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'}
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{pool.name}</h3>
                    <p className="text-sm text-gray-500">
                      Season {pool.season} &bull; Code: {pool.inviteCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2 py-1 text-xs rounded-full
                      ${pool.status === 'active' ? 'bg-green-100 text-green-700' :
                        pool.status === 'locked' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'}
                    `}>
                      {pool.status}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyInviteLink(pool.inviteCode);
                      }}
                    >
                      Copy Link
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedPoolId && (
        <div className="bg-green-50 p-3 rounded-lg text-green-700 text-sm">
          Selected pool: <strong>{pools[selectedPoolId]?.name}</strong>.
          Use the tabs above to manage teams, results, and entries.
        </div>
      )}
    </div>
  );
};
