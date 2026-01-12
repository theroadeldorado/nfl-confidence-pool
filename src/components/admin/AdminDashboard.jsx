import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { PoolManager } from './PoolManager';
import { TeamManager } from './TeamManager';
import { ResultsManager } from './ResultsManager';
import { EntriesManager } from './EntriesManager';

const TABS = {
  POOLS: 'pools',
  TEAMS: 'teams',
  RESULTS: 'results',
  ENTRIES: 'entries',
};

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(TABS.POOLS);
  const [selectedPoolId, setSelectedPoolId] = useState(null);
  const [selectedPool, setSelectedPool] = useState(null);

  // Load selected pool data to get invite code
  useEffect(() => {
    if (!selectedPoolId) {
      setSelectedPool(null);
      return;
    }

    const poolRef = ref(database, `pools/${selectedPoolId}`);
    const unsubscribe = onValue(poolRef, (snapshot) => {
      setSelectedPool(snapshot.val());
    });
    return () => unsubscribe();
  }, [selectedPoolId]);

  const handleLogout = async () => {
    await logout();
  };

  const openPoolLink = (path) => {
    if (selectedPool?.inviteCode) {
      window.open(`/pool/${selectedPool.inviteCode}/${path}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-green-800 text-white p-4 shadow">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            {selectedPool && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openPoolLink('leaderboard')}
                  className="text-sm bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded transition"
                  title="Open Leaderboard"
                >
                  📊 Leaderboard
                </button>
                <button
                  onClick={() => openPoolLink('bracket')}
                  className="text-sm bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded transition"
                  title="Open Bracket"
                >
                  🏆 Bracket
                </button>
                <button
                  onClick={() => openPoolLink('')}
                  className="text-sm bg-green-700 hover:bg-green-600 px-3 py-1.5 rounded transition"
                  title="Open Pool Home"
                >
                  🏠 Pool
                </button>
              </div>
            )}
            <span className="text-green-200 text-sm">{user?.email}</span>
            <Button variant="secondary" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <nav className="flex">
            {Object.entries(TABS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setActiveTab(value)}
                className={`
                  px-6 py-3 font-medium text-sm border-b-2 transition
                  ${activeTab === value
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'}
                `}
              >
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-6xl mx-auto p-4">
        {activeTab === TABS.POOLS && (
          <PoolManager
            selectedPoolId={selectedPoolId}
            onSelectPool={setSelectedPoolId}
          />
        )}
        {activeTab === TABS.TEAMS && (
          <TeamManager poolId={selectedPoolId} />
        )}
        {activeTab === TABS.RESULTS && (
          <ResultsManager poolId={selectedPoolId} />
        )}
        {activeTab === TABS.ENTRIES && (
          <EntriesManager poolId={selectedPoolId} />
        )}
      </main>
    </div>
  );
};
