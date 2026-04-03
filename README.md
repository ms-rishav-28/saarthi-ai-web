# Saarthi AI Web

Landing page for Saarthi AI, an India-focused AI navigator for government schemes.

## Project Structure

- `index.html`: Primary landing page served at `/` on Vercel.
- `saarthi-ai.html`: Source-equivalent landing page file (kept for compatibility).
- `vercel.json`: Optional static hosting config.

## Local Development

This project is a static HTML page, so no build step is required.

### Option 1: Open Directly

Open `saarthi-ai.html` in your browser.

### Option 2: Run a Local Static Server (recommended)

If you have Node.js:

```bash
npx serve .
```

Then visit the local URL shown in the terminal.

## Deploy to Vercel

### One-time Setup

1. Push this repo to GitHub.
2. In Vercel, click **Add New → Project**.
3. Import this repository.
4. Framework preset: **Other** (or leave auto-detected).
5. Build Command: **(leave empty)**.
6. Output Directory: **(leave empty)**.
7. Deploy.

### Why It Works

- The app is static and requires no server runtime.
- Vercel serves `index.html` at the root path by default.

## Optional: Deploy with Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

For production deployment:

```bash
vercel --prod
```

## Notes

- Theme toggle, animations, and form interactions are fully client-side.
- Waitlist entries are currently stored only in in-memory JavaScript (`signups` array) and reset on page refresh.