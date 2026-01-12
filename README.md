# 🏈 NFL Playoff Confidence Pool 2026

A simple web app for managing NFL playoff confidence pool entries. Share a link with friends, and everyone can submit their rankings!

## Features

- Submit confidence rankings (1-14 points) for all 14 playoff teams
- Real-time updates when entries are submitted
- Share link to invite pool members
- Mobile-friendly design
- Entries sync across all users via Firebase

## Quick Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or use an existing one)
3. Give it a name like "nfl-confidence-pool"
4. Disable Google Analytics (optional, not needed)
5. Click "Create project"

### 2. Enable Realtime Database

1. In your Firebase project, go to **Build → Realtime Database**
2. Click "Create Database"
3. Choose your region
4. Start in **test mode** (you can secure it later)
5. Click "Enable"

### 3. Get Your Firebase Config

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" and click the web icon `</>`
3. Register your app with a nickname
4. Copy the `firebaseConfig` object values

### 4. Set Up Environment Variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Deploy to Vercel

1. Push this repo to GitHub
2. Go to [Vercel](https://vercel.com) and import your repo
3. Add the environment variables from step 4 in Vercel's project settings
4. Deploy!

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

## Securing Your Database (Recommended)

After testing, update your Firebase Realtime Database rules:

```json
{
  "rules": {
    "entries": {
      ".read": true,
      "$uid": {
        ".write": true
      }
    }
  }
}
```

This allows anyone to read entries but only write to their own entry.

## Customization

### Update Teams

Edit the `AFC_TEAMS` and `NFC_TEAMS` arrays in `src/App.jsx` to update for future seasons.

### Styling

The app uses Tailwind CSS. Modify classes in `src/App.jsx` or add custom styles to `src/index.css`.

## License

MIT - Feel free to use and modify!
# nfl-confidence-pool
