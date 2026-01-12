const https = require('https');

const DATABASE_URL = 'https://confidence-pool-9e109-default-rtdb.firebaseio.com';

const teams = {
  afc: [
    { seed: 1, name: 'Denver Broncos', record: '14-3', eliminated: false },
    { seed: 2, name: 'New England Patriots', record: '14-3', eliminated: false },
    { seed: 3, name: 'Jacksonville Jaguars', record: '13-4', eliminated: false },
    { seed: 4, name: 'Pittsburgh Steelers', record: '10-7', eliminated: false },
    { seed: 5, name: 'Houston Texans', record: '12-5', eliminated: false },
    { seed: 6, name: 'Buffalo Bills', record: '12-5', eliminated: false },
    { seed: 7, name: 'Los Angeles Chargers', record: '11-6', eliminated: false },
  ],
  nfc: [
    { seed: 1, name: 'Seattle Seahawks', record: '14-3', eliminated: false },
    { seed: 2, name: 'Chicago Bears', record: '11-6', eliminated: false },
    { seed: 3, name: 'Philadelphia Eagles', record: '11-6', eliminated: false },
    { seed: 4, name: 'Carolina Panthers', record: '8-9', eliminated: false },
    { seed: 5, name: 'Los Angeles Rams', record: '12-5', eliminated: false },
    { seed: 6, name: 'San Francisco 49ers', record: '12-5', eliminated: false },
    { seed: 7, name: 'Green Bay Packers', record: '9-7-1', eliminated: false },
  ]
};

const url = `${DATABASE_URL}/pools/pool_2026_default/teams.json`;

const req = https.request(url, { method: 'PUT' }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Teams updated successfully!');
      console.log('');
      console.log('AFC Teams:');
      teams.afc.forEach(t => console.log(`  ${t.seed}. ${t.name} (${t.record})`));
      console.log('');
      console.log('NFC Teams:');
      teams.nfc.forEach(t => console.log(`  ${t.seed}. ${t.name} (${t.record})`));
    } else {
      console.error('❌ Error:', data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(JSON.stringify(teams));
req.end();
