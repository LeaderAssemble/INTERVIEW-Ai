CREATE DATABASE IF NOT EXISTS interviewai
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE interviewai;

CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL PRIMARY KEY,
  email VARCHAR(320) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Retained as a compatibility snapshot for sessions saved before normalized storage.
CREATE TABLE IF NOT EXISTS interview_sessions (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  category ENUM('hr', 'technical', 'behavioral') NOT NULL,
  started_at DATETIME(3) NOT NULL,
  completed_at DATETIME(3) NULL,
  duration INT UNSIGNED NOT NULL DEFAULT 0,
  overall_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  questions JSON NOT NULL,
  answers JSON NOT NULL,
  feedbacks JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user_started (user_id, started_at)
);

CREATE TABLE IF NOT EXISTS user_streaks (
  user_id CHAR(36) NOT NULL PRIMARY KEY,
  current_streak INT UNSIGNED NOT NULL DEFAULT 0,
  longest_streak INT UNSIGNED NOT NULL DEFAULT 0,
  last_practice_date DATE NULL,
  total_practice_days INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_streak_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS interview_ai_usage (
  user_id CHAR(36) NOT NULL PRIMARY KEY,
  window_started_at DATETIME NOT NULL,
  request_count TINYINT UNSIGNED NOT NULL DEFAULT 0,
  CONSTRAINT fk_ai_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
