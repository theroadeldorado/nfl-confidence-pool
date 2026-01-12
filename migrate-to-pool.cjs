/**
 * Migration Script - Move existing entries to a pool structure
 */

const https = require('https');

const DATABASE_URL = 'https://confidence-pool-9e109-default-rtdb.firebaseio.com';

function firebaseRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = `${DATABASE_URL}${path}.json`;
    const req = https.request(url, { method }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function migrate() {
  console.log('🔄 Checking for existing entries...');
  
  // Check if there are entries at the old location
  const oldEntries = await firebaseRequest('/entries');
  
  if (!oldEntries) {
    console.log('No existing entries found.');
    return;
  }

  // Check if entries are already in pool format (has nested poolId keys)
  const firstKey = Object.keys(oldEntries)[0];
  const firstValue = oldEntries[firstKey];
  
  if (firstValue && firstValue.rankings) {
    console.log('Found entries in old format. Migrating to pool structure...');
    
    // Create a default pool
    const poolId = 'pool_2026_default';
    const inviteCode = 'FAMILY26';
    
    const poolData = {
      name: 'Family Pool 2026',
      season: '2026',
      status: 'active',
      inviteCode: inviteCode,
      createdAt: new Date().toISOString(),
      teams: {
        afc: [
          { seed: 1, name: 'Chiefs', record: '15-2', eliminated: false },
          { seed: 2, name: 'Bills', record: '13-4', eliminated: false },
          { seed: 3, name: 'Ravens', record: '12-5', eliminated: false },
          { seed: 4, name: 'Texans', record: '10-7', eliminated: false },
          { seed: 5, name: 'Chargers', record: '11-6', eliminated: false },
          { seed: 6, name: 'Steelers', record: '10-7', eliminated: false },
          { seed: 7, name: 'Broncos', record: '10-7', eliminated: false }
        ],
        nfc: [
          { seed: 1, name: 'Lions', record: '15-2', eliminated: false },
          { seed: 2, name: 'Eagles', record: '14-3', eliminated: false },
          { seed: 3, name: 'Buccaneers', record: '10-7', eliminated: false },
          { seed: 4, name: 'Rams', record: '10-7', eliminated: false },
          { seed: 5, name: 'Vikings', record: '14-3', eliminated: false },
          { seed: 6, name: 'Commanders', record: '12-5', eliminated: false },
          { seed: 7, name: 'Packers', record: '11-6', eliminated: false }
        ]
      },
      results: {}
    };
    
    // Create pool
    await firebaseRequest(`/pools/${poolId}`, 'PUT', poolData);
    console.log(`✅ Created pool: ${poolData.name}`);
    
    // Save invite code lookup
    await firebaseRequest(`/inviteCodes/${inviteCode}`, 'PUT', `"${poolId}"`);
    console.log(`✅ Invite code ${inviteCode} linked to pool`);
    
    // Move entries to pool
    for (const [username, entry] of Object.entries(oldEntries)) {
      const newEntry = {
        rankings: entry.rankings || entry,
        submittedAt: entry.submittedAt || new Date().toISOString(),
        fingerprint: entry.fingerprint || 'migrated',
        score: entry.score || 0
      };
      await firebaseRequest(`/entries/${poolId}/${username}`, 'PUT', newEntry);
      console.log(`  Migrated entry: ${username}`);
    }
    
    // Remove old entries (commented out for safety)
    // await firebaseRequest('/entries', 'DELETE');
    console.log('');
    console.log('✅ Migration complete!');
    console.log(`   Pool URL: http://localhost:5174/pool/${inviteCode}`);
    console.log('');
    console.log('Note: Old entries at /entries are still there. Delete them manually if desired.');
  } else {
    console.log('Entries appear to already be in pool format.');
  }
}

migrate().catch(console.error);
