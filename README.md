# InterviewAI

InterviewAI is a mock-interview practice app with a React/Vite frontend, a Node/Express API, MySQL persistence, Supabase authentication, and server-side Gemini AI features.

## Features

- Public introduction page and Supabase email/password sign-in, sign-up, and password recovery.
- HR, technical, and behavioral interview practice with text or browser speech-recognition input.
- Optional Gemini-generated questions tailored to interview category, role, and experience level.
- Semantic answer evaluation with relevance, clarity, completeness, and communication scores (0–10).
- Gemini-powered assistant for signed-in users; demo mode uses the built-in local FAQ.
- Interview history, progress dashboard, streaks, and downloadable reports.
- Normalized MySQL persistence for users, interviews, questions, answers, evaluations, and results.

## Requirements

- Node.js 20.6 or later
- MySQL 8 (or a compatible MySQL server)
- A Supabase project for authentication
- A Gemini API key for signed-in Gemini features

## Local setup

1. Install dependencies:

   ```powershell
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the values locally. Never commit `.env`.

   Required settings:

   - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`: Supabase project URL and public anon key.
   - `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`: MySQL connection.
   - `GEMINI_API_KEY`: private Gemini key; this is read by the Node API only.
   - Optional: `GEMINI_MODEL` (defaults to `gemini-3.1-flash-lite`), `API_PORT` (defaults to `3001`), and `HOST` (defaults to `0.0.0.0`).

3. Create the database schema:

   ```powershell
   npm run db:setup
   ```

4. Start the API and frontend:

   ```powershell
   npm run dev
   ```

   Open `http://localhost:5173`. The API health check is `http://127.0.0.1:3001/api/health`.

## Database

`server/schema.sql` creates the compatibility session/streak/usage tables. Numbered SQL files under `server/migrations/` add the normalized interview data schema. Run `npm run db:setup` to apply both. Existing Supabase data is not migrated or deleted.

## Gemini and scoring

Gemini is called only by the Node API; never add its key to a `VITE_` variable. Signed-in Gemini requests share a limit of 20 requests per user per hour. Answer evaluation validates the structured model response and computes the weighted total server-side:

- Relevance: 30%
- Clarity: 25%
- Completeness: 25%
- Communication: 20%

An empty or irrelevant answer receives zero. Provider errors, timeouts, rate limits, and malformed output return explicit fallback statuses instead of crashing the interview. Demo sessions use local questions, rule-based feedback, and the built-in FAQ.

## Mobile microphone and password recovery

Mobile browsers require HTTPS for microphone/speech recognition. `npm run dev:lan` is suitable for testing the site over the same Wi-Fi, but its HTTP address supports text, not phone microphone access. Use a trusted HTTPS deployment for microphone input.

Supabase reset emails return to the URL where the reset was requested. Add each intended app origin to **Authentication → URL Configuration → Redirect URLs** in the same Supabase project configured by `.env`. For local desktop testing, allow `http://localhost:5173/**`. Request a new reset email after changing redirect configuration.

## Production deployment

The API can serve the built frontend and API from one HTTPS origin:

```powershell
npm run build
$env:NODE_ENV = 'production'
npm start
```

Deploy the Node API to a Node hosting service and use a managed MySQL database for a public deployment; a developer's local MySQL database is not reachable from a hosted service. Configure the same environment variables in the host's private settings, set `API_PORT` to the port provided by the host, and update the Supabase redirect allow-list to the final HTTPS app URL. Do not publish credentials, `.env`, or user data.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```
