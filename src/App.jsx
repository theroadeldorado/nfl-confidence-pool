import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, onValue, set, get } from 'firebase/database';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { PoolProvider, usePool, resolveInviteCode } from './contexts/PoolContext';
import { useFingerprint } from './hooks/useFingerprint';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Button } from './components/common/Button';
import { Card } from './components/common/Card';
import { PlayoffBracket } from './components/bracket/PlayoffBracket';
import { Leaderboard } from './components/leaderboard/Leaderboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { TeamLogo } from './constants/teamAbbreviations';

// Parse current URL path
const getPathInfo = () => {
  const path = window.location.pathname;
  const parts = path.split('/').filter(Boolean);

  if (parts[0] === 'admin') {
    return { type: 'admin' };
  }

  if (parts[0] === 'pool' && parts[1]) {
    return { type: 'pool', inviteCode: parts[1], subpath: parts[2] || '' };
  }

  return { type: 'home' };
};

// Navigation helper
const navigate = (path) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

// Main App with routing
export default function App() {
  const [pathInfo, setPathInfo] = useState(getPathInfo());

  useEffect(() => {
    const handlePopState = () => setPathInfo(getPathInfo());
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <AuthProvider>
      <AppRouter pathInfo={pathInfo} />
    </AuthProvider>
  );
}

// Router component
function AppRouter({ pathInfo }) {
  const { isAdmin, loading: authLoading } = useAuth();

  // Admin routes
  if (pathInfo.type === 'admin') {
    if (authLoading) return <LoadingSpinner />;
    return isAdmin ? <AdminDashboard /> : <AdminLogin />;
  }

  // Pool routes
  if (pathInfo.type === 'pool') {
    return <PoolRoutes inviteCode={pathInfo.inviteCode} subpath={pathInfo.subpath} />;
  }

  // Home/landing
  return <LandingPage />;
}

// Pool routes with context
function PoolRoutes({ inviteCode, subpath }) {
  const [poolId, setPoolId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const resolve = async () => {
      const id = await resolveInviteCode(inviteCode);
      if (id) {
        setPoolId(id);
      } else {
        setError('Pool not found');
      }
      setLoading(false);
    };
    resolve();
  }, [inviteCode]);

  if (loading) return <LoadingSpinner />;
  if (error) return <NotFoundPage message={error} />;

  return (
    <PoolProvider poolId={poolId}>
      <PoolApp subpath={subpath} inviteCode={inviteCode} />
    </PoolProvider>
  );
}

// Pool app with views
function PoolApp({ subpath, inviteCode }) {
  const { pool, teams, results, entries, loading, error } = usePool();
  const [view, setView] = useState(subpath || 'home');

  useEffect(() => {
    setView(subpath || 'home');
  }, [subpath]);

  const navigatePool = (newView) => {
    navigate(`/pool/${inviteCode}${newView ? '/' + newView : ''}`);
    setView(newView || 'home');
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <NotFoundPage message={error} />;

  switch (view) {
    case 'submit':
      return <SubmitView pool={pool} teams={teams} entries={entries} onNavigate={navigatePool} inviteCode={inviteCode} />;
    case 'submitted':
      return <SubmittedView onNavigate={navigatePool} />;
    case 'results':
      return <ResultsView pool={pool} teams={teams} entries={entries} results={results} onNavigate={navigatePool} />;
    case 'leaderboard':
      return <LeaderboardView pool={pool} teams={teams} entries={entries} results={results} onNavigate={navigatePool} />;
    case 'bracket':
      return <BracketView pool={pool} teams={teams} results={results} onNavigate={navigatePool} />;
    default:
      return <PoolHomeView pool={pool} entries={entries} teams={teams} results={results} onNavigate={navigatePool} inviteCode={inviteCode} />;
  }
}

// Landing page
function LandingPage() {
  const [pools, setPools] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const poolsRef = ref(database, 'pools');
    const unsubscribe = onValue(poolsRef, (snapshot) => {
      setPools(snapshot.val() || {});
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <LoadingSpinner />;

  const activePoolList = Object.entries(pools)
    .filter(([, p]) => p.status === 'active')
    .map(([id, p]) => ({ id, ...p }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8 pt-8">
          <div className="text-6xl mb-4">🏈</div>
          <h1 className="text-3xl font-bold text-white">NFL Playoff Pool</h1>
          <p className="text-green-200 mt-2">Confidence Rankings</p>
        </div>

        {activePoolList.length > 0 && (
          <Card variant="dark" className="mb-6">
            <h2 className="text-white font-semibold mb-3">Active Pools</h2>
            <div className="space-y-2">
              {activePoolList.map((pool) => (
                <button
                  key={pool.id}
                  onClick={() => navigate(`/pool/${pool.inviteCode}`)}
                  className="w-full bg-white/20 text-white p-3 rounded-lg text-left hover:bg-white/30 transition"
                >
                  <div className="font-medium">{pool.name}</div>
                  <div className="text-green-200 text-sm">Season {pool.season}</div>
                </button>
              ))}
            </div>
          </Card>
        )}

        <Card variant="dark">
          <h2 className="text-white font-semibold mb-3">Join a Pool</h2>
          <p className="text-green-200 text-sm mb-4">
            Have an invite link? Paste it in your browser or ask the pool admin for the code.
          </p>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => navigate('/admin')}
            className="text-green-200"
          >
            Admin Login
          </Button>
        </Card>
      </div>
    </div>
  );
}

// Pool home view
function PoolHomeView({ pool, entries, teams, results, onNavigate, inviteCode }) {
  const [copied, setCopied] = useState(false);
  const [showBracket, setShowBracket] = useState(false);
  const isLocked = pool?.status === 'locked';

  const copyShareLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/pool/${inviteCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // When locked, show leaderboard directly
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">🏈</div>
            <h1 className="text-2xl font-bold text-gray-800">{pool?.name || 'NFL Playoff Pool'}</h1>
            <p className="text-gray-500">{pool?.season} Confidence Rankings</p>
          </div>

          {/* Toggle buttons */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setShowBracket(false)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                !showBracket ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              📊 Leaderboard
            </button>
            <button
              onClick={() => setShowBracket(true)}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition ${
                showBracket ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              🏆 Bracket
            </button>
          </div>

          {showBracket ? (
            <Card>
              <PlayoffBracket teams={teams} results={results} />
            </Card>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Click on any entry to see their picks.
              </p>
              <Leaderboard entries={entries} results={results} teams={teams} />
            </>
          )}
        </div>
      </div>
    );
  }

  // Unlocked - show normal home with submit option
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏈</div>
          <h1 className="text-2xl font-bold text-white">{pool?.name || 'NFL Playoff Pool'}</h1>
          <p className="text-green-200">{pool?.season} Confidence Rankings</p>
        </div>

        <Card variant="dark" className="mb-6">
          <p className="text-green-100 text-sm">
            Assign points 1-14 to each playoff team. When a team wins, you earn those points!
            Higher points = more confidence in that team winning.
          </p>
        </Card>

        <div className="space-y-3 mb-6">
          <Button fullWidth onClick={() => onNavigate('submit')}>
            Submit My Picks
          </Button>

          <Button variant="secondary" fullWidth onClick={() => onNavigate('leaderboard')}>
            Leaderboard
          </Button>

          <Button variant="secondary" fullWidth onClick={() => onNavigate('bracket')}>
            View Bracket
          </Button>

          <Button variant="secondary" fullWidth onClick={() => onNavigate('results')}>
            View All Entries ({Object.keys(entries).length})
          </Button>
        </div>

        <Card variant="dark">
          <p className="text-green-200 text-sm mb-2">Share this pool:</p>
          <Button variant="secondary" fullWidth onClick={copyShareLink}>
            {copied ? '✓ Link Copied!' : '📋 Copy Share Link'}
          </Button>
        </Card>
      </div>
    </div>
  );
}

// Submit view
function SubmitView({ pool, teams, entries, onNavigate, inviteCode }) {
  const { fingerprint, loading: fpLoading } = useFingerprint();
  const [name, setName] = useState('');
  const [rankings, setRankings] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingUser, setExistingUser] = useState(null);

  const isLocked = pool?.status === 'locked';
  const allTeams = [...(teams?.afc || []), ...(teams?.nfc || [])];

  // Redirect if pool is locked
  if (isLocked) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
        <div className="max-w-md mx-auto text-center pt-12">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Submissions Closed</h1>
          <p className="text-green-200 mb-8">The playoffs have started. No new submissions are being accepted.</p>
          <Button onClick={() => onNavigate('leaderboard')}>View Leaderboard</Button>
        </div>
      </div>
    );
  }

  // Check fingerprint on load
  useEffect(() => {
    if (!fingerprint || !inviteCode) return;

    const checkFingerprint = async () => {
      const fpRef = ref(database, `fingerprints/${inviteCode}/${fingerprint}`);
      const snapshot = await get(fpRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        setExistingUser(data.username);
        setName(data.username);
        // Load existing rankings
        const entryRef = ref(database, `entries/${inviteCode}/${data.username}`);
        const entrySnapshot = await get(entryRef);
        if (entrySnapshot.exists()) {
          setRankings(entrySnapshot.val().rankings || {});
        }
      }
    };
    checkFingerprint();
  }, [fingerprint, inviteCode]);

  const handleRankingChange = (teamName, value) => {
    const num = parseInt(value);
    if (value === '' || (num >= 1 && num <= 14)) {
      setRankings(prev => ({ ...prev, [teamName]: value === '' ? '' : num }));
    }
  };

  const validateRankings = () => {
    const values = Object.values(rankings).filter(v => v !== '');
    if (values.length !== 14) return 'Please assign points (1-14) to all 14 teams';
    const unique = new Set(values);
    if (unique.size !== 14) return 'Each point value must be unique (1-14)';
    return null;
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    // Check if this fingerprint already submitted with a different name
    if (existingUser && existingUser !== name.trim()) {
      setError(`This device already submitted as "${existingUser}". You can only update that entry.`);
      return;
    }

    const validationError = validateRankings();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Get pool ID from invite code
      const poolId = await resolveInviteCode(inviteCode);

      // Save entry
      const entryRef = ref(database, `entries/${poolId}/${name.trim()}`);
      await set(entryRef, {
        rankings,
        submittedAt: new Date().toISOString(),
        fingerprint,
        score: 0,
      });

      // Save fingerprint mapping
      await set(ref(database, `fingerprints/${poolId}/${fingerprint}`), {
        username: name.trim(),
        submittedAt: new Date().toISOString(),
      });

      onNavigate('submitted');
    } catch (e) {
      console.error('Submit error:', e);
      setError('Failed to save. Please try again.');
    }
    setSubmitting(false);
  };

  const usedNumbers = new Set(Object.values(rankings).filter(v => v !== ''));

  if (fpLoading) return <LoadingSpinner message="Preparing..." />;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-lg mx-auto">
        <button onClick={() => onNavigate('')} className="text-green-700 mb-4 font-medium">
          ← Back
        </button>

        <h1 className="text-xl font-bold mb-4">Submit Your Picks</h1>

        <Card className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-700">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={!!existingUser}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-green-500 outline-none disabled:bg-gray-100"
            placeholder="Enter your name"
          />
          {existingUser && (
            <p className="text-amber-600 text-sm mt-2">
              Updating existing entry for {existingUser}
            </p>
          )}
          {entries[name.trim()] && !existingUser && (
            <p className="text-amber-600 text-sm mt-2">⚠️ This will update the existing entry</p>
          )}
        </Card>

        <div className="bg-blue-50 rounded-xl p-3 mb-4">
          <p className="text-blue-800 text-sm">
            <strong>Points remaining:</strong>{' '}
            {[...Array(14)].map((_, i) => i + 1).filter(n => !usedNumbers.has(n)).join(', ') || 'None'}
          </p>
        </div>

        {/* AFC Teams */}
        <div className="mb-4">
          <h2 className="font-bold text-red-700 mb-2 flex items-center gap-2">
            <span className="bg-red-700 text-white px-2 py-0.5 rounded text-xs">AFC</span>
            American Football Conference
          </h2>
          <div className="space-y-2">
            {(teams?.afc || []).map(team => (
              <div key={team.name} className="flex items-center bg-white p-3 rounded-lg border-l-4 border-red-600 shadow-sm">
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={rankings[team.name] || ''}
                  onChange={(e) => handleRankingChange(team.name, e.target.value)}
                  className="w-14 p-2 border-2 border-gray-200 rounded mr-3 text-center font-bold focus:border-green-500 outline-none"
                  placeholder="#"
                />
                <TeamLogo teamName={team.name} size={36} className="mr-3" />
                <div className="flex-1">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-gray-400 text-sm ml-2">#{team.seed} seed</span>
                </div>
                <span className="text-gray-500 text-sm">{team.record}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NFC Teams */}
        <div className="mb-4">
          <h2 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
            <span className="bg-blue-700 text-white px-2 py-0.5 rounded text-xs">NFC</span>
            National Football Conference
          </h2>
          <div className="space-y-2">
            {(teams?.nfc || []).map(team => (
              <div key={team.name} className="flex items-center bg-white p-3 rounded-lg border-l-4 border-blue-600 shadow-sm">
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={rankings[team.name] || ''}
                  onChange={(e) => handleRankingChange(team.name, e.target.value)}
                  className="w-14 p-2 border-2 border-gray-200 rounded mr-3 text-center font-bold focus:border-green-500 outline-none"
                  placeholder="#"
                />
                <TeamLogo teamName={team.name} size={36} className="mr-3" />
                <div className="flex-1">
                  <span className="font-medium">{team.name}</span>
                  <span className="text-gray-400 text-sm ml-2">#{team.seed} seed</span>
                </div>
                <span className="text-gray-500 text-sm">{team.record}</span>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <Button
          fullWidth
          variant="success"
          onClick={handleSubmit}
          disabled={submitting}
          className="mb-8"
        >
          {submitting ? 'Submitting...' : 'Submit My Picks'}
        </Button>
      </div>
    </div>
  );
}

// Submitted confirmation
function SubmittedView({ onNavigate }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-800 p-4">
      <div className="max-w-md mx-auto text-center pt-12">
        <div className="text-7xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-white mb-2">Entry Submitted!</h1>
        <p className="text-green-200 mb-8">Your picks have been saved.</p>

        <div className="space-y-3">
          <Button fullWidth onClick={() => onNavigate('leaderboard')}>
            View Leaderboard
          </Button>
          <Button variant="secondary" fullWidth onClick={() => onNavigate('')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// Leaderboard view
function LeaderboardView({ pool, teams, entries, results, onNavigate }) {
  const [copied, setCopied] = useState(false);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => onNavigate('')} className="text-green-700 font-medium">
            ← Back
          </button>
          <button
            onClick={copyShareLink}
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition"
          >
            {copied ? '✓ Copied!' : '📋 Share'}
          </button>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Leaderboard</h1>
          <span className="text-sm text-gray-500">{Object.keys(entries).length} entries</span>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Click on any entry to see their picks. Teams with green rings have won games.
        </p>

        <Leaderboard entries={entries} results={results} teams={teams} />

        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-700">{pool?.name}</p>
              <p className="text-sm text-gray-500">Season {pool?.season}</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => onNavigate('bracket')}>
              View Bracket
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Bracket view
function BracketView({ pool, teams, results, onNavigate }) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => onNavigate('')} className="text-green-700 mb-4 font-medium">
          ← Back
        </button>

        <h1 className="text-xl font-bold mb-4">Playoff Bracket</h1>

        <Card>
          <PlayoffBracket teams={teams} results={results} />
        </Card>
      </div>
    </div>
  );
}

// Results view (all entries table)
function ResultsView({ pool, teams, entries, results, onNavigate }) {
  const [copied, setCopied] = useState(false);
  const entryList = Object.entries(entries).sort((a, b) =>
    a[0].toLowerCase().localeCompare(b[0].toLowerCase())
  );

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const allTeams = [...(teams?.afc || []), ...(teams?.nfc || [])];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => onNavigate('')} className="text-green-700 font-medium">
            ← Back
          </button>
          <span className="text-gray-500 text-sm">Updates in real-time</span>
        </div>

        <h1 className="text-xl font-bold mb-4">All Entries ({entryList.length})</h1>

        {entryList.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-600 mb-4">No entries yet. Be the first to submit!</p>
            <Button onClick={() => onNavigate('submit')}>Submit My Picks</Button>
          </Card>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-800 text-white">
                  <th className="p-3 text-left sticky left-0 bg-green-800 z-10">Team</th>
                  {entryList.map(([entryName]) => (
                    <th key={entryName} className="p-3 text-center min-w-[70px] font-medium">
                      {entryName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-red-100">
                  <td colSpan={entryList.length + 1} className="p-2 font-bold text-red-800 text-xs">
                    AFC
                  </td>
                </tr>
                {(teams?.afc || []).map((team, i) => (
                  <tr key={team.name} className={i % 2 === 0 ? 'bg-red-50/50' : 'bg-white'}>
                    <td className="p-2 font-medium sticky left-0 bg-inherit whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">#{team.seed}</span>
                        <TeamLogo teamName={team.name} size={24} />
                        <span>{team.name}</span>
                      </div>
                    </td>
                    {entryList.map(([entryName, data]) => {
                      const pts = data.rankings?.[team.name];
                      return (
                        <td key={entryName} className="p-2 text-center">
                          <span className={`inline-block w-8 h-8 leading-8 rounded-full font-bold ${
                            pts >= 12 ? 'bg-green-500 text-white' :
                            pts >= 8 ? 'bg-green-200 text-green-800' :
                            pts >= 4 ? 'bg-gray-200 text-gray-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {pts || '-'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
                <tr className="bg-blue-100">
                  <td colSpan={entryList.length + 1} className="p-2 font-bold text-blue-800 text-xs">
                    NFC
                  </td>
                </tr>
                {(teams?.nfc || []).map((team, i) => (
                  <tr key={team.name} className={i % 2 === 0 ? 'bg-blue-50/50' : 'bg-white'}>
                    <td className="p-2 font-medium sticky left-0 bg-inherit whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs">#{team.seed}</span>
                        <TeamLogo teamName={team.name} size={24} />
                        <span>{team.name}</span>
                      </div>
                    </td>
                    {entryList.map(([entryName, data]) => {
                      const pts = data.rankings?.[team.name];
                      return (
                        <td key={entryName} className="p-2 text-center">
                          <span className={`inline-block w-8 h-8 leading-8 rounded-full font-bold ${
                            pts >= 12 ? 'bg-green-500 text-white' :
                            pts >= 8 ? 'bg-green-200 text-green-800' :
                            pts >= 4 ? 'bg-gray-200 text-gray-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {pts || '-'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Card className="mt-6">
          <p className="text-gray-600 text-sm mb-2">Share this pool with others:</p>
          <Button fullWidth variant="success" onClick={copyShareLink}>
            {copied ? '✓ Link Copied!' : '📋 Copy Share Link'}
          </Button>
        </Card>
      </div>
    </div>
  );
}

// Not found page
function NotFoundPage({ message }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md text-center">
        <div className="text-6xl mb-4">🤔</div>
        <h1 className="text-xl font-bold mb-2">Pool Not Found</h1>
        <p className="text-gray-600 mb-4">{message || 'This pool does not exist or has been removed.'}</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </Card>
    </div>
  );
}
