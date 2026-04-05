# Saarthi AI - Landing Page & Core Backend

[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0.3-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.0.0-339933?style=flat&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-000000?style=flat&logo=express)](https://expressjs.com/)
[![Neon](https://img.shields.io/badge/Neon-1.0.2-00D4AA?style=flat&logo=postgresql)](https://neon.tech/)
[![LangGraph](https://img.shields.io/badge/LangGraph-0.2.62-FF6B35?style=flat)](https://langchain-ai.github.io/langgraph/)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.0.0-0055FF?style=flat&logo=framer)](https://www.framer.com/motion/)

This repo hosts the marketing landing page with a production-ready waitlist backend and the Saarthi Core MVP backend for PM Matru Vandana WhatsApp pipeline.

## What Was Fixed

- Fixed blank-page runtime crash by importing missing Framer Motion symbols in `DemoCard`.
- Added real waitlist backend at `api/waitlist.js` (Vercel serverless function).
- Added Neon Postgres persistence (`supabase/waitlist.sql`).
- Wired waitlist form to backend with:
	- API submit
	- persisted count fetch
	- loading/error states
	- consent checkbox
	- anti-bot honeypot field
- Implemented Saarthi Core MVP backend with LangGraph orchestration, WhatsApp/DigiLocker integrations, and Neon persistence.
- Migrated all persistence from Supabase to Neon Postgres.
- Recreated deleted checkpointer files for LangGraph.

## Architecture

- **Landing Page Frontend**: React + Vite + Framer Motion
- **Landing Backend API**: Vercel serverless function (`/api/waitlist`)
- **Saarthi Core Backend**: Node.js + Express + TypeScript + LangGraph orchestration
- **Database**: Neon Postgres for both landing waitlist and core workflow/consent state
- **Integrations**: WhatsApp Cloud API, DigiLocker OAuth, Vertex AI Gemini, Sarvam STT/TTS placeholders
- **Persistence**: LangGraph Postgres checkpointer for workflow resume

## Local Setup

### Landing Page

1. Install dependencies

```bash
npm install
```

2. Create env file

```bash
cp .env.example .env
```

3. Set values in `.env`

- `DATABASE_URL` (Neon connection string)

4. Apply SQL in Neon SQL Editor

- Run `supabase/waitlist.sql`

5. Start dev server

```bash
npm run dev
```

### Saarthi Core

1. Navigate to core directory

```bash
cd saarthi-core
```

2. Install dependencies

```bash
npm install
```

3. Create env file

```bash
cp .env.example .env
```

4. Set values in `.env`

- `DATABASE_URL` (same Neon connection string)
- `WHATSAPP_VERIFY_TOKEN`
- `DIGILOCKER_CLIENT_ID`
- `DIGILOCKER_CLIENT_SECRET`
- `VERTEX_AI_PROJECT_ID`
- `PORT` (optional, defaults to 8080)

5. Apply SQL in Neon SQL Editor

- Run `supabase/schema.sql`

6. Run smoke test

```bash
npm run smoke:neon
```

7. Start dev server

```bash
npm run dev
```

## API Contract

### Landing Waitlist

#### `GET /api/waitlist`
Returns the current waitlist count.

Response:

```json
{ "count": 123 }
```

#### `POST /api/waitlist`
Stores one waitlist submission.

Payload:

```json
{
	"name": "Jane Doe",
	"email": "jane@example.com",
	"role": "citizen",
	"location": "Pune, Maharashtra",
	"consent": true,
	"website": ""
}
```

Success response:

```json
{ "ok": true, "count": 124 }
```

### Saarthi Core

Core endpoints are for WhatsApp webhooks and DigiLocker OAuth callbacks. See `saarthi-core/server.ts` for details.

- `GET /healthz`: Health check
- `GET /webhook/whatsapp`: WhatsApp verification
- `POST /webhook/whatsapp`: WhatsApp message processing
- `GET /oauth/digilocker/callback`: DigiLocker consent completion

## Deploy

### Landing Page (Vercel)

1. Import this repo in Vercel.
2. Add environment variables in project settings:
	- `DATABASE_URL`
3. Deploy.

The waitlist endpoint works in production:
- `https://your-domain.com/api/waitlist`

### Saarthi Core (Vercel or Railway)

1. Deploy the `saarthi-core` directory as a separate service.
2. Set environment variables:
	- `DATABASE_URL`
	- `WHATSAPP_VERIFY_TOKEN`
	- `DIGILOCKER_CLIENT_ID`
	- `DIGILOCKER_CLIENT_SECRET`
	- `VERTEX_AI_PROJECT_ID`
	- `PORT`
3. Ensure Neon is in `ap-southeast-1` region for compliance.
4. Run `npm run smoke:neon` post-deploy to verify.

## Notes

- PII is not persisted in browser storage.
- Server validates and normalizes all input.
- Server-side rate limiting is included as a baseline guard.
- Saarthi Core uses LangGraph for stateful workflow orchestration with Postgres checkpointing.
- Compliance: Consent audit logging, masked Aadhaar, retry/circuit breaker for gov APIs.
- Fallback to CSC portals if online submission fails.
