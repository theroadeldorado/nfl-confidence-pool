/**
 * Admin Setup Script
 * 
 * Before running this script:
 * 1. Go to Firebase Console: https://console.firebase.google.com/project/confidence-pool-9e109
 * 2. Click "Authentication" in the left sidebar
 * 3. Click "Get started"
 * 4. Click "Email/Password" and enable it
 * 5. Go to "Users" tab and click "Add user"
 * 6. Create an admin user with email and password
 * 7. Copy the User UID shown in the table
 * 8. Run: node setup-admin.cjs <UID> <email>
 */

const https = require('https');

const DATABASE_URL = 'https://confidence-pool-9e109-default-rtdb.firebaseio.com';

const args = process.argv.slice(2);
if (args.length < 2) {
  console.log('Usage: node setup-admin.cjs <uid> <email>');
  console.log('');
  console.log('Steps:');
  console.log('1. Go to Firebase Console → Authentication → Get started');
  console.log('2. Enable Email/Password sign-in method');
  console.log('3. Add a user with email/password');
  console.log('4. Copy the User UID from the table');
  console.log('5. Run this script with the UID and email');
  process.exit(1);
}

const [uid, email] = args;

const adminData = {
  email: email,
  name: email.split('@')[0],
  createdAt: new Date().toISOString()
};

const url = `${DATABASE_URL}/admins/${uid}.json`;

const req = https.request(url, { method: 'PUT' }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Admin user added successfully!');
      console.log(`   UID: ${uid}`);
      console.log(`   Email: ${email}`);
      console.log('');
      console.log('You can now log in at: http://localhost:5174/admin');
    } else {
      console.error('❌ Error:', data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(JSON.stringify(adminData));
req.end();
