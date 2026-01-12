import React, { useState, useEffect } from 'react';
import { database } from '../../firebase';
import { ref, onValue, remove, update } from 'firebase/database';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Modal } from '../common/Modal';

export const EntriesManager = ({ poolId }) => {
  const [entries, setEntries] = useState({});
  const [teams, setTeams] = useState({ afc: [], nfc: [] });
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    if (!poolId) {
      setLoading(false);
      return;
    }

    const entriesRef = ref(database, `entries/${poolId}`);
    const teamsRef = ref(database, `pools/${poolId}/teams`);

    const unsubEntries = onValue(entriesRef, (snapshot) => {
      setEntries(snapshot.val() || {});
      setLoading(false);
    });

    const unsubTeams = onValue(teamsRef, (snapshot) => {
      setTeams(snapshot.val() || { afc: [], nfc: [] });
    });

    return () => {
      unsubEntries();
      unsubTeams();
    };
  }, [poolId]);

  const handleDelete = async (username) => {
    if (!confirm(`Delete entry for ${username}?`)) return;
    try {
      await remove(ref(database, `entries/${poolId}/${username}`));
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  };

  const handleEdit = (username) => {
    setEditingEntry({
      username,
      rankings: { ...entries[username].rankings },
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    try {
      await update(ref(database, `entries/${poolId}/${editingEntry.username}`), {
        rankings: editingEntry.rankings,
      });
      setEditingEntry(null);
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const handleRankingChange = (teamName, value) => {
    setEditingEntry(prev => ({
      ...prev,
      rankings: {
        ...prev.rankings,
        [teamName]: parseInt(value) || 0,
      },
    }));
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
    return <div className="text-center py-8">Loading entries...</div>;
  }

  const entryList = Object.entries(entries).sort((a, b) =>
    a[0].toLowerCase().localeCompare(b[0].toLowerCase())
  );

  const allTeams = [...teams.afc, ...teams.nfc];

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-bold mb-4">
          All Entries ({entryList.length})
        </h2>

        {entryList.length === 0 ? (
          <p className="text-gray-500">No entries yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Score</th>
                  <th className="p-3 text-left">Submitted</th>
                  <th className="p-3 text-left">Fingerprint</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {entryList.map(([username, entry]) => (
                  <tr key={username} className="border-t">
                    <td className="p-3 font-medium">{username}</td>
                    <td className="p-3">{entry.score || 0}</td>
                    <td className="p-3 text-gray-500 text-xs">
                      {new Date(entry.submittedAt).toLocaleString()}
                    </td>
                    <td className="p-3 text-gray-400 text-xs font-mono">
                      {entry.fingerprint?.substring(0, 8)}...
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedEntry({ username, ...entry })}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(username)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(username)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title={`${selectedEntry?.username}'s Picks`}
      >
        {selectedEntry && (
          <div className="space-y-2">
            {Object.entries(selectedEntry.rankings || {})
              .sort((a, b) => b[1] - a[1])
              .map(([team, points]) => (
                <div key={team} className="flex justify-between p-2 bg-gray-50 rounded">
                  <span>{team}</span>
                  <span className="font-bold">{points}</span>
                </div>
              ))}
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title={`Edit ${editingEntry?.username}'s Picks`}
      >
        {editingEntry && (
          <div className="space-y-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {allTeams.map((team) => (
                <div key={team.name} className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="14"
                    value={editingEntry.rankings[team.name] || ''}
                    onChange={(e) => handleRankingChange(team.name, e.target.value)}
                    className="w-16 p-2 border rounded text-center"
                  />
                  <span>{team.name}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditingEntry(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
