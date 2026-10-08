/*
# Create interview_sessions table for session history

1. New Tables
- `interview_sessions` - stores complete interview session data
  - `id` (uuid, primary key)
  - `category` (text) - interview type: 'hr', 'technical', or 'behavioral'
  - `started_at` (timestamptz) - session start timestamp
  - `completed_at` (timestamptz, nullable) - session end timestamp
  - `duration` (integer) - total duration in seconds
  - `overall_score` (integer) - average score across all answers
  - `questions` (jsonb) - array of question objects with id, text, difficulty, keywords, tips
  - `answers` (jsonb) - array of answer objects with id, questionId, transcript, duration, timestamp
  - `feedbacks` (jsonb) - array of feedback objects with scores and improvement suggestions
  - `created_at` (timestamptz) - record creation timestamp

2. Security
- Enable RLS on `interview_sessions`.
- Allow anon + authenticated full CRUD access (single-tenant, no auth required).
- Using (true) is intentional because data is intentionally shared/public.

3. Notes
- JSONB columns allow flexible nested data storage matching the TypeScript types
- GIN index on category for filtering sessions by category
- Sessions are ordered by started_at for history viewing
*/

CREATE TABLE IF NOT EXISTS interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('hr', 'technical', 'behavioral')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  duration integer NOT NULL DEFAULT 0,
  overall_score integer NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  feedbacks jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE interview_sessions ENABLE ROW LEVEL SECURITY;

-- Create index for category filtering
CREATE INDEX IF NOT EXISTS idx_interview_sessions_category ON interview_sessions(category);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_started_at ON interview_sessions(started_at DESC);

-- CRUD policies for anon + authenticated (single-tenant app)
DROP POLICY IF EXISTS "anon_select_sessions" ON interview_sessions;
CREATE POLICY "anon_select_sessions" ON interview_sessions FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_sessions" ON interview_sessions;
CREATE POLICY "anon_insert_sessions" ON interview_sessions FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_sessions" ON interview_sessions;
CREATE POLICY "anon_update_sessions" ON interview_sessions FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_sessions" ON interview_sessions;
CREATE POLICY "anon_delete_sessions" ON interview_sessions FOR DELETE
  TO anon, authenticated USING (true);