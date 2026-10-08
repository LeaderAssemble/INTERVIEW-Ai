# Local MySQL and API setup

Supabase remains responsible only for sign-in. Interview history, streaks, and Gemini requests use this Node API and local MySQL. Existing Supabase records are not copied or deleted.

## Configure MySQL

Add the MySQL settings shown in `.env.example` to `.env`. Keep the existing Supabase URL and anon key values. Set `MYSQL_PASSWORD` to the password for your local MySQL account. The default account is `root`; use another account if that is how MySQL was installed.

Create the database and tables from the project directory:

```text
npm run db:setup
```

The setup command reads your local MySQL password from `.env`, creates the `interviewai` database if needed, and applies the base schema and migrations. The normalized tables are `users`, `interviews`, `questions`, `answers`, `evaluations`, and `interview_results`; the existing session snapshot and streak/usage tables remain for compatibility. It does not copy or delete existing Supabase data.

## Start the app

```powershell
npm install
npm run dev
```

`npm run dev` starts the API at `http://127.0.0.1:3001` and Vite at `http://localhost:5173`. The Vite development server proxies `/api` requests to the API. The API checks each account's Supabase access token before accessing its MySQL records.

### Test password recovery from a phone on the same Wi-Fi

Reset emails redirect to the origin where the reset was requested. A link containing `localhost` only works on the computer running the app, not on a phone. To test on a phone, run `npm run dev:lan`, use the Vite `Network` URL printed in the terminal (for example, `http://192.168.1.20:5173`) on the phone while it is connected to the same Wi-Fi, and request the reset email from that phone's browser. Open the email link in that same browser so the Supabase recovery session is available.

In the Supabase dashboard, add that exact LAN origin with `/**` to **Authentication → URL Configuration → Redirect URLs** (for the example above, `http://192.168.1.20:5173/**`). Keep `http://localhost:5173/**` in the list for desktop development. LAN addresses can change; update the allow-list entry if yours changes. This HTTP LAN URL is for text and account-flow testing only: mobile browsers require a secure HTTPS context for microphone/speech recognition. Use a trusted HTTPS deployment or HTTPS tunnel for phone voice input. Use `npm run dev` as usual for desktop-only development.

The Gemini key is read only by the Node API from `.env`; it is never sent to the browser. Set `GEMINI_API_KEY` and optionally `GEMINI_MODEL` (default: `gemini-3.1-flash-lite`). Signed-in users get fresh, role- and experience-specific Gemini questions by default. The generator avoids questions and scenarios from that account's recent completed sessions, and varies each request. The API allows up to 20 Gemini requests per signed-in account per hour. Demo sessions continue to use local browser storage and built-in feedback.

### Semantic answer evaluation

The authenticated `POST /api/ai/evaluate-answer` endpoint asks Gemini to compare the question, optional reference answer, and candidate response, and requires structured JSON. The backend validates the scores and calculates `total_score` itself on a 0–10 scale: relevance 30%, clarity 25%, completeness 25%, and communication 20%. Irrelevant responses and keyword stuffing cannot earn a high score; empty responses receive explicit zero-score feedback without a Gemini request. Missing references are allowed. Timeouts, rate limits, provider failures, and invalid model output return explicit evaluation statuses and safe feedback instead of crashing the interview.

The endpoint returns category scores, total score, feedback, strengths, improvements, and status for the existing feedback UI. On interview completion, the answer and its evaluation are saved transactionally to MySQL alongside the interview result and the legacy session snapshot.

Signed-in users can also send messages to the InterviewAI assistant through `POST /api/ai/chat`; messages are evaluated by Gemini on the server, and the API key is never sent to the browser. Demo mode uses the built-in local FAQ instead. Chat requests share the per-user Gemini limit of 20 requests per hour with generated questions and answer evaluations.

Verify the database/API is available at `http://127.0.0.1:3001/api/health`. To create a production build, run `npm run build`, set `NODE_ENV=production`, and start with `npm start`; the API server then serves the built frontend.
