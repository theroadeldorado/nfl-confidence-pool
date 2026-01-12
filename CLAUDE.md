# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
```

## Architecture

**Stack:** Vite + React 18 + Tailwind CSS + Firebase Realtime Database

**Single-file React app** (`src/App.jsx`) with view-based routing via useState:
- `home` - Landing page with navigation
- `submit` - Form for entering confidence rankings (1-14 points per team)
- `submitted` - Confirmation after submission
- `results` - Table showing all entries with real-time updates

**Data flow:**
- Firebase Realtime Database stores entries at `/entries/{username}`
- `onValue` listener provides real-time sync across all connected clients
- No authentication - users identified by name only

**Team configuration:** AFC_TEAMS and NFC_TEAMS arrays at top of App.jsx contain playoff team data (seed, name, record). Update these each season.

## Environment Variables

Copy `.env.example` to `.env` and fill in Firebase config values. For Vercel deployment, add these as environment variables in the Vercel dashboard.

Required variables (all prefixed with `VITE_FIREBASE_`):
- API_KEY, AUTH_DOMAIN, DATABASE_URL, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID
