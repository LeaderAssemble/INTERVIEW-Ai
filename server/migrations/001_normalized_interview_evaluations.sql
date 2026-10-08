CREATE TABLE IF NOT EXISTS interviews (
  id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  category ENUM('hr', 'technical', 'behavioral') NOT NULL,
  started_at DATETIME(3) NOT NULL,
  completed_at DATETIME(3) NULL,
  duration INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_interviews_user_started (user_id, started_at),
  CONSTRAINT fk_interviews_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(36) NOT NULL,
  interview_id CHAR(36) NOT NULL,
  question_order SMALLINT UNSIGNED NOT NULL,
  category ENUM('hr', 'technical', 'behavioral') NOT NULL,
  question_text TEXT NOT NULL,
  difficulty ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  reference_answer JSON NULL,
  keywords JSON NOT NULL,
  tips JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (interview_id, id),
  UNIQUE KEY uq_questions_interview_order (interview_id, question_order),
  CONSTRAINT fk_questions_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answers (
  id CHAR(36) NOT NULL PRIMARY KEY,
  interview_id CHAR(36) NOT NULL,
  question_id VARCHAR(36) NOT NULL,
  answer_text TEXT NOT NULL,
  duration INT UNSIGNED NOT NULL DEFAULT 0,
  answered_at DATETIME(3) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_answers_interview_question (interview_id, question_id),
  INDEX idx_answers_question (interview_id, question_id),
  CONSTRAINT fk_answers_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_answers_question FOREIGN KEY (interview_id, question_id) REFERENCES questions(interview_id, id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evaluations (
  id CHAR(36) NOT NULL PRIMARY KEY,
  answer_id CHAR(36) NOT NULL,
  relevant BOOLEAN NOT NULL DEFAULT FALSE,
  relevance_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  clarity_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  completeness_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  communication_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  total_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  feedback TEXT NOT NULL,
  strengths JSON NOT NULL,
  improvements JSON NOT NULL,
  evaluation_status ENUM('evaluated', 'empty', 'timeout', 'rate_limited', 'invalid_response', 'unavailable') NOT NULL DEFAULT 'evaluated',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_evaluations_answer (answer_id),
  CONSTRAINT fk_evaluations_answer FOREIGN KEY (answer_id) REFERENCES answers(id) ON DELETE CASCADE,
  CONSTRAINT chk_evaluation_relevance CHECK (relevance_score BETWEEN 0 AND 10),
  CONSTRAINT chk_evaluation_clarity CHECK (clarity_score BETWEEN 0 AND 10),
  CONSTRAINT chk_evaluation_completeness CHECK (completeness_score BETWEEN 0 AND 10),
  CONSTRAINT chk_evaluation_communication CHECK (communication_score BETWEEN 0 AND 10),
  CONSTRAINT chk_evaluation_total CHECK (total_score BETWEEN 0 AND 10)
);

CREATE TABLE IF NOT EXISTS interview_results (
  interview_id CHAR(36) NOT NULL PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  total_score DECIMAL(4,2) NOT NULL DEFAULT 0,
  overall_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
  evaluated_answer_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  completed_at DATETIME(3) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_results_user_completed (user_id, completed_at),
  CONSTRAINT fk_results_interview FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  CONSTRAINT fk_results_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
