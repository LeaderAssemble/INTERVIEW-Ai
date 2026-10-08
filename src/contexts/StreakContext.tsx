import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from './AuthContext';

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null;
  totalPracticeDays: number;
}

interface StreakContextType {
  streak: StreakData;
  streakLoading: boolean;
  recordPracticeDay: () => Promise<void>;
}

const demoStreakKey = 'interviewStreak:demo';
const defaultStreak: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  totalPracticeDays: 0,
};

const StreakContext = createContext<StreakContextType | undefined>(undefined);

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a + 'T00:00:00Z');
  const dateB = new Date(b + 'T00:00:00Z');
  return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
}

export function StreakProvider({ children }: { children: ReactNode }) {
  const { user, isDemo } = useAuth();
  const [streak, setStreak] = useState<StreakData>(defaultStreak);
  const [streakLoading, setStreakLoading] = useState(true);

  const loadStreak = useCallback(async () => {
    if (!user) {
      setStreak(defaultStreak);
      setStreakLoading(false);
      return;
    }

    if (isDemo) {
      try {
        const stored = localStorage.getItem(demoStreakKey);
        setStreak(stored ? JSON.parse(stored) as StreakData : defaultStreak);
      } catch (error) {
        console.error('Failed to load demo streak:', error);
        setStreak(defaultStreak);
      } finally {
        setStreakLoading(false);
      }
      return;
    }

    try {
      const data = await apiRequest<{
        current_streak: number;
        longest_streak: number;
        last_practice_date: string | null;
        total_practice_days: number;
      }>('/streak');
      setStreak({
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastPracticeDate: data.last_practice_date,
        totalPracticeDays: data.total_practice_days,
      });
    } catch (error) {
      console.error('Failed to load streak from MySQL API:', error);
      setStreak(defaultStreak);
    } finally {
      setStreakLoading(false);
    }
  }, [user, isDemo]);

  useEffect(() => {
    if (user) {
      loadStreak();
    } else {
      setStreak(defaultStreak);
      setStreakLoading(false);
    }
  }, [user, loadStreak]);

  const recordPracticeDay = useCallback(async () => {
    if (!user) return;

    const today = toDateString(new Date());
    const lastDate = streak.lastPracticeDate;

    let newCurrentStreak: number;
    let newTotalDays: number;

    if (!lastDate) {
      newCurrentStreak = 1;
      newTotalDays = 1;
    } else if (lastDate === today) {
      return;
    } else {
      const gap = daysBetween(lastDate, today);
      if (gap === 1) {
        newCurrentStreak = streak.currentStreak + 1;
      } else if (gap <= 0) {
        return;
      } else {
        newCurrentStreak = 1;
      }
      newTotalDays = streak.totalPracticeDays + 1;
    }

    const newLongestStreak = Math.max(newCurrentStreak, streak.longestStreak);

    const updatedStreak = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastPracticeDate: today,
      totalPracticeDays: newTotalDays,
    };
    setStreak(updatedStreak);

    if (isDemo) {
      localStorage.setItem(demoStreakKey, JSON.stringify(updatedStreak));
      return;
    }
    try {
      await apiRequest<void>('/streak', {
        method: 'PUT',
        body: JSON.stringify({
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastPracticeDate: today,
          totalPracticeDays: newTotalDays,
        }),
      });
    } catch (error) {
      console.error('Failed to save streak to MySQL API:', error);
      loadStreak();
    }
  }, [user, isDemo, streak, loadStreak]);

  return (
    <StreakContext.Provider value={{ streak, streakLoading, recordPracticeDay }}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
}
