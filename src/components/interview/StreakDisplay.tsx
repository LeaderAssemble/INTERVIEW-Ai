import { motion } from 'framer-motion';
import { Flame, Trophy, Calendar, Target } from 'lucide-react';
import { useStreak } from '../../contexts/StreakContext';

const streakMilestones = [3, 7, 14, 30, 50, 100];

function getNextMilestone(current: number): number {
  return streakMilestones.find(m => m > current) ?? Math.ceil(current / 10) * 10 + 10;
}

export function StreakDisplay() {
  const { streak, streakLoading } = useStreak();

  if (streakLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card relative overflow-hidden"
      >
        <div className="h-32 animate-pulse bg-secondary-800/30 rounded-xl" />
      </motion.div>
    );
  }

  const nextMilestone = getNextMilestone(streak.currentStreak);
  const progressToNext = streak.currentStreak === 0 ? 0 :
    Math.min(100, (streak.currentStreak / nextMilestone) * 100);
  const daysToNext = nextMilestone - streak.currentStreak;

  const today = new Date().toISOString().split('T')[0];
  const practicedToday = streak.lastPracticeDate === today;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="card relative overflow-hidden group"
    >
      {/* Glow background */}
      <div className={`absolute inset-0 opacity-30 transition-opacity duration-500 ${
        streak.currentStreak > 0 ? 'opacity-100' : 'opacity-30'
      }`}>
        <div className="absolute top-0 right-0 w-40 h-40 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-warning-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={streak.currentStreak > 0 ? {
                scale: [1, 1.1, 1],
                rotate: [0, -3, 3, 0],
              } : {}}
              transition={{
                duration: 1.5,
                repeat: streak.currentStreak > 0 ? Infinity : 0,
                repeatDelay: 1,
              }}
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                streak.currentStreak > 0
                  ? 'bg-gradient-to-br from-warning-500 to-error-500 shadow-lg shadow-warning-500/30'
                  : 'bg-secondary-800/50'
              }`}
            >
              <Flame className={`w-6 h-6 ${
                streak.currentStreak > 0 ? 'text-white' : 'text-secondary-500'
              }`} />
            </motion.div>
            <div>
              <h3 className="font-semibold text-lg">Daily Streak</h3>
              <p className="text-xs text-secondary-400">
                {practicedToday ? 'Completed today!' : 'Practice today to keep it going'}
              </p>
            </div>
          </div>

          <div className="text-right">
            <motion.div
              key={streak.currentStreak}
              initial={{ scale: 1.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`text-4xl font-bold ${
                streak.currentStreak >= 7 ? 'gradient-text' : 'text-warning-400'
              }`}>
              {streak.currentStreak}
            </motion.div>
            <p className="text-xs text-secondary-400">days</p>
          </div>
        </div>

        {/* Progress to next milestone */}
        {streak.currentStreak > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-secondary-400 mb-1.5">
              <span className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                Next: {nextMilestone} days
              </span>
              <span>{daysToNext} day{daysToNext !== 1 ? 's' : ''} to go</span>
            </div>
            <div className="progress-bar">
              <motion.div
                className="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        )}

        {/* Day dots visualization */}
        <div className="flex gap-1.5 mb-4">
          {Array.from({ length: 7 }).map((_, i) => {
            const isFilled = i < streak.currentStreak % 7 || (streak.currentStreak >= 7);
            const isToday = i === (streak.currentStreak % 7) && !practicedToday && streak.currentStreak < 7;
            return (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  isFilled
                    ? 'bg-gradient-to-r from-warning-500 to-accent-500'
                    : isToday
                    ? 'bg-warning-500/30 border border-warning-500/40'
                    : 'bg-secondary-800/50'
                }`}
              />
            );
          })}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-lg p-3 flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-accent-400 flex-shrink-0" />
            <div>
              <div className="text-lg font-bold text-accent-400">{streak.longestStreak}</div>
              <p className="text-xs text-secondary-400">Best streak</p>
            </div>
          </div>
          <div className="glass rounded-lg p-3 flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-primary-400 flex-shrink-0" />
            <div>
              <div className="text-lg font-bold text-primary-400">{streak.totalPracticeDays}</div>
              <p className="text-xs text-secondary-400">Total days</p>
            </div>
          </div>
        </div>

        {/* Milestone badges */}
        {streak.currentStreak > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
            {streakMilestones.slice(0, 4).map((m) => {
              const achieved = streak.currentStreak >= m;
              return (
                <div
                  key={m}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    achieved
                      ? 'bg-gradient-to-r from-warning-500/20 to-accent-500/20 text-warning-300 border border-warning-500/30'
                      : 'bg-secondary-800/30 text-secondary-500 border border-secondary-700/30'
                  }`}
                >
                  <Flame className={`w-3 h-3 ${achieved ? 'text-warning-400' : 'text-secondary-600'}`} />
                  {m} days
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
