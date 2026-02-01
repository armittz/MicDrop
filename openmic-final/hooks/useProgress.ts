import { useState, useEffect, useCallback } from 'react';
import { UserProgress, PracticeSession } from '../types';
import { STORAGE_KEY, LEVELS } from '../constants';

const INITIAL_PROGRESS: UserProgress = {
  streak: 0,
  lastPracticeDate: null,
  totalTimeSpoken: 0,
  confidenceHistory: [20],
  practiceSessions: [],
  currentLevelId: '1',
  completedPromptIds: [],
  badges: []
};

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_PROGRESS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const addSession = useCallback(
    (session: PracticeSession, promptId: string) => {
      setProgress(prev => {
        const today = new Date().toDateString();
        let newStreak = prev.streak;

        if (prev.lastPracticeDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (prev.lastPracticeDate === yesterday.toDateString()) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        }

        const updatedCompleted = prev.completedPromptIds.includes(promptId)
          ? prev.completedPromptIds
          : [...prev.completedPromptIds, promptId];

        // Level progression
        let nextLevelId = prev.currentLevelId;
        const currentLevelIndex = LEVELS.findIndex(
          l => l.id === prev.currentLevelId
        );
        const nextLevel = LEVELS[currentLevelIndex + 1];

        if (nextLevel && updatedCompleted.length >= (currentLevelIndex + 1) * 3) {
          nextLevelId = nextLevel.id;
        }

        // Badges
        const newBadges = [...prev.badges];
        if (updatedCompleted.length >= 1 && !newBadges.includes('First Word')) {
          newBadges.push('First Word');
        }
        if (newStreak >= 3 && !newBadges.includes('Daily Master')) {
          newBadges.push('Daily Master');
        }
        if (
          updatedCompleted.length >= 10 &&
          !newBadges.includes('Goal Achiever')
        ) {
          newBadges.push('Goal Achiever');
        }

        return {
          ...prev,
          streak: newStreak,
          lastPracticeDate: today,
          totalTimeSpoken: prev.totalTimeSpoken + session.duration,
          currentLevelId: nextLevelId,
          completedPromptIds: updatedCompleted,
          badges: newBadges,
          confidenceHistory: [...prev.confidenceHistory, session.confidence],

          // ✅ CRITICAL FIX:
          // Always store the NEW Gemini feedback first
          practiceSessions: [
            {
              ...session,
              feedback: session.feedback
            },
            ...prev.practiceSessions
          ].slice(0, 50)
        };
      });
    },
    []
  );

  return { progress, addSession };
};
