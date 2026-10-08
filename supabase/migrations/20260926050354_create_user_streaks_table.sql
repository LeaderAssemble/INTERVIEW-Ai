/*
# Create user_streaks table for daily practice streaks

1. New Tables
- `user_streaks` - tracks each user's daily interview practice streak
  - `user_id` (uuid, primary key, references auth.users) - the user this streak belongs to
  - `current_streak` (integer, default 0) - consecutive days practiced
  - `longest_streak` (integer, default 0) - best streak ever achieved
  - `last_practice_date` (date, nullable) - the most recent day the user practiced
  - `total_practice_days` (integer, default 0) - total distinct days the user has ever practiced
  - `updated_at` (timestamptz) - last time this row was modified

2. Security
- Enable RLS on `user_streaks`.
- Owner-scoped CRUD: each authenticated user can only access their own streak row.
- user_id is the primary key and has DEFAULT auth.uid() so upserts from the client work without explicitly passing user_id.

3. Notes
- The streak logic is computed client-side: when a session is completed, the frontend compares today's date with last_practice_date.
  - If last_practice_date is yesterday (or today, for idempotency), the streak continues.
  - If there is a gap, the streak resets to 1.
- The upsert pattern (ON CONFLICT) allows the client to safely update its streak row in a single call.
*/

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id uuid PRIMARY KEY DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_practice_date date,
  total_practice_days integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;

-- Owner-scoped CRUD policies
DROP POLICY IF EXISTS "select_own_streak" ON user_streaks;
CREATE POLICY "select_own_streak" ON user_streaks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_streak" ON user_streaks;
CREATE POLICY "insert_own_streak" ON user_streaks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_streak" ON user_streaks;
CREATE POLICY "update_own_streak" ON user_streaks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_streak" ON user_streaks;
CREATE POLICY "delete_own_streak" ON user_streaks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
