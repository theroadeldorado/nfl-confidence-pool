import React, { createContext, useContext, useState, useEffect } from 'react';
import { database } from '../firebase';
import { ref, onValue, get } from 'firebase/database';

const PoolContext = createContext(null);

export const usePool = () => {
  const context = useContext(PoolContext);
  if (!context) {
    throw new Error('usePool must be used within PoolProvider');
  }
  return context;
};

export const PoolProvider = ({ poolId, children }) => {
  const [pool, setPool] = useState(null);
  const [teams, setTeams] = useState({ afc: [], nfc: [] });
  const [results, setResults] = useState({});
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!poolId) {
      setLoading(false);
      return;
    }

    // Listen to pool data
    const poolRef = ref(database, `pools/${poolId}`);
    const unsubPool = onValue(poolRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPool(data);
        setTeams(data.teams || { afc: [], nfc: [] });
        setResults(data.results || {});
        setError(null);
      } else {
        setError('Pool not found');
      }
      setLoading(false);
    }, (err) => {
      console.error('Pool error:', err);
      setError('Failed to load pool');
      setLoading(false);
    });

    // Listen to entries for this pool
    const entriesRef = ref(database, `entries/${poolId}`);
    const unsubEntries = onValue(entriesRef, (snapshot) => {
      setEntries(snapshot.val() || {});
    });

    return () => {
      unsubPool();
      unsubEntries();
    };
  }, [poolId]);

  const value = {
    poolId,
    pool,
    teams,
    results,
    entries,
    loading,
    error,
  };

  return (
    <PoolContext.Provider value={value}>
      {children}
    </PoolContext.Provider>
  );
};

// Helper to resolve invite code to pool ID
export const resolveInviteCode = async (inviteCode) => {
  const codeRef = ref(database, `inviteCodes/${inviteCode}`);
  const snapshot = await get(codeRef);
  return snapshot.val(); // Returns poolId or null
};
