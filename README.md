# InterviewAI

InterviewAI is a mock-interview practice app with a React/Vite frontend, a Node/Express API, MySQL persistence, Supabase authentication, and server-side Gemini AI features.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://dashboard.render.com/blueprint/new?repo=https://github.com/LeaderAssemble/InterviewAI)

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

The included [`render.yaml`](./render.yaml) configures a free Render web service to build and serve the frontend and API from one HTTPS origin. The API reads Render's `PORT`; local development continues to use `API_PORT`. On each start, the service applies the project's idempotent MySQL schema setup before launching the API.

Use the **Deploy to Render** button above to create the service from this GitHub repository. Before the service can become healthy, create a MySQL-compatible database (the steps below use TiDB Cloud Starter) and provide its connection values, plus the Supabase URL/anon key and Gemini API key, in Render's Blueprint setup. These credentials are entered into Render and must not be committed to GitHub. Once Render finishes deploying, it will show the service's public `https://<your-service>.onrender.com` URL.

For a no-card, no-subscription demo setup, pair Render's Free web service with TiDB Cloud Starter (MySQL-compatible). Render Free services have 512 MB RAM, share a 750-hour monthly workspace allowance, and sleep after 15 idle minutes; the first request after sleep can take about a minute. Render's free filesystem is temporary, so all interview data must remain in the database. TiDB Starter has monthly free usage quotas; stay within them and do not add a payment method if you want to avoid paid usage. Check both providers' current plan and usage pages before creating resources, since free-tier limits can change.

Create a TiDB Cloud Starter cluster in a nearby AWS region, then use its secure connection details in the Render Blueprint prompts: `MYSQL_HOST` from TiDB, port `4000`, the generated username/password, database `interviewai`, and TLS enabled. Add the Supabase URL/anon key and Gemini API key when prompted. Permit the Render service's outbound database connection in TiDB's network access settings; use a strong unique database password and keep it private. After the first successful deployment, add the final `https://<your-service>.onrender.com/**` URL to the Supabase Authentication → URL Configuration → Redirect URLs allow-list. Do not publish credentials, `.env`, or user data.

### Free static demo deployment

For a no-database demo, import this repository into Vercel and deploy it with the included [`vercel.json`](./vercel.json). It builds using `npm run build:demo`, which starts directly in demo mode and needs no Supabase, Gemini, or MySQL credentials. Demo interviews, history, and streaks are stored only in the visitor's browser; AI-generated questions, semantic Gemini evaluation, account sign-in, and cross-device sync are not available in this static demo. The regular Render production build is unchanged.

## Checks

```powershell
npm run typecheck
npm test
npm run build
npm run build:demo
```
