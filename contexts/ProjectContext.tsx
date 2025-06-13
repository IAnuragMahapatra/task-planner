// @/contexts/ProjectContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from 'next-themes';
import { LocalProgressManager, UserProgress, DEFAULT_PROGRESS, ProgressSummary } from '@/lib/localStorage';

interface ProjectContextType {
  currentDay: number;
  setCurrentDay: (day: number) => void;
  completedTasks: Record<string, boolean[]>;
  toggleTask: (day: number, taskIndex: number) => void;
  getTotalCompletedTasks: () => number;
  getTotalTasks: () => number;
  getDayCompletedTasks: (day: number) => number;
  getDayTotalTasks: (day: number) => number;
  userProgress: UserProgress;
  updateProgress: (progress: Partial<UserProgress>) => void;
  exportData: () => string;
  importData: (data: string) => boolean;
  clearAllData: () => void;
  getProgressSummary: () => ProgressSummary;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const INITIAL_USER_PROGRESS: UserProgress = DEFAULT_PROGRESS;

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setTheme } = useTheme();
  const [userProgress, setUserProgress] = useState<UserProgress>(INITIAL_USER_PROGRESS);
  const [tasksData, setTasksData] = useState<Record<string, string[]>>({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedProgress = LocalProgressManager.loadProgress();
    setUserProgress(savedProgress);
    if (savedProgress.preferences.theme) {
      setTheme(savedProgress.preferences.theme);
    }
  }, [setTheme]);

  useEffect(() => {
    const loadTasksData = async () => {
      try {
        const response = await fetch('/data/tasksData.json');
        const data = await response.json();
        setTasksData(data);
      } catch (error) {
        console.error('Error loading tasks data:', error);
      }
    };

    loadTasksData();
  }, []);

  useEffect(() => {
    if (isMounted) {
      LocalProgressManager.saveProgress(userProgress);
    }
  }, [userProgress, isMounted]);

  const handleSetCurrentDay = useCallback((day: number) => {
    setUserProgress(prev => ({ ...prev, currentDay: day }));
  }, []);

  const handleToggleTask = useCallback((day: number, taskIndex: number) => {
    setUserProgress(prev => {
      const dayKey = day.toString();
      const dayTasks = prev.completedTasks[dayKey] || [];
      const newDayTasks = [...dayTasks];
      newDayTasks[taskIndex] = !newDayTasks[taskIndex];

      const newCompletedTasks = {
        ...prev.completedTasks,
        [dayKey]: newDayTasks
      };

      const tasksCompleted = newDayTasks.filter(Boolean).length;
      const totalTasks = tasksData[dayKey]?.length || 0;

      const updatedDailyStats = {
        ...prev.dailyStats,
        [dayKey]: {
          ...(prev.dailyStats[dayKey] || { focusTime: 0, realDate: new Date().toISOString().split('T')[0] }),
          tasksCompleted: tasksCompleted,
          totalTasks: totalTasks,
          lastUpdated: new Date().toISOString(),
        }
      };

      if (isMounted) {
        LocalProgressManager.updateDailyStats(day, tasksCompleted, totalTasks, updatedDailyStats[dayKey].focusTime);
      }

      return {
        ...prev,
        completedTasks: newCompletedTasks,
        dailyStats: updatedDailyStats,
      };
    });
  }, [isMounted, tasksData]);

  const handleUpdateProgress = useCallback((progress: Partial<UserProgress>) => {
    setUserProgress(prev => {
      const updated = {
        ...prev,
        ...progress,
        preferences: {
          ...prev.preferences,
          ...progress.preferences,
        },
      };

      if (isMounted && progress.preferences?.theme) {
        setTheme(progress.preferences.theme);
      }

      return updated;
    });
  }, [isMounted, setTheme]);

  const memoizedGetTotalCompletedTasks = useCallback(() => {
    return Object.values(userProgress.completedTasks)
      .flat()
      .filter(Boolean).length;
  }, [userProgress.completedTasks]);

  const memoizedGetTotalTasks = useCallback(() => {
    return Object.values(tasksData).reduce((total, dayTasks) => total + dayTasks.length, 0);
  }, [tasksData]);

  const memoizedGetDayCompletedTasks = useCallback((day: number) => {
    const dayKey = day.toString();
    const dayTasks = userProgress.completedTasks[dayKey] || [];
    return dayTasks.filter(Boolean).length;
  }, [userProgress.completedTasks]);

  const memoizedGetDayTotalTasks = useCallback((day: number) => {
    const dayKey = day.toString();
    return tasksData[dayKey]?.length || 0;
  }, [tasksData]);

  const handleExportData = useCallback(() => {
    if (!isMounted) return '';
    return LocalProgressManager.exportProgress();
  }, [isMounted]);

  const handleImportData = useCallback((data: string) => {
    if (!isMounted) return false;
    const success = LocalProgressManager.importProgress(data);
    if (success) {
      const newProgress = LocalProgressManager.loadProgress();
      setUserProgress(newProgress);

      if (newProgress.preferences.theme) {
        setTheme(newProgress.preferences.theme);
      }
    }
    return success;
  }, [isMounted, setTheme]);

  const handleClearAllData = useCallback(() => {
    if (!isMounted) return;
    LocalProgressManager.clearAllData();
    const resetProgress = LocalProgressManager.loadProgress();
    setUserProgress(resetProgress);

    setTheme('system');
  }, [isMounted, setTheme]);

  const memoizedGetProgressSummary = useCallback(() => {
    if (!isMounted) {
      return {
        totalTasksCompleted: 0,
        totalDaysActive: 0,
        totalFocusTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        daysSinceStart: 0,
        activeDaysThisWeek: 0,
        activeDaysThisMonth: 0,
      };
    }
    return LocalProgressManager.getProgressSummary();
  }, [isMounted]);

  const contextValue = useMemo(() => ({
    currentDay: userProgress.currentDay,
    setCurrentDay: handleSetCurrentDay,
    completedTasks: userProgress.completedTasks,
    toggleTask: handleToggleTask,
    getTotalCompletedTasks: memoizedGetTotalCompletedTasks,
    getTotalTasks: memoizedGetTotalTasks,
    getDayCompletedTasks: memoizedGetDayCompletedTasks,
    getDayTotalTasks: memoizedGetDayTotalTasks,
    userProgress,
    updateProgress: handleUpdateProgress,
    exportData: handleExportData,
    importData: handleImportData,
    clearAllData: handleClearAllData,
    getProgressSummary: memoizedGetProgressSummary,
  }), [
    userProgress,
    handleSetCurrentDay,
    handleToggleTask,
    memoizedGetTotalCompletedTasks,
    memoizedGetTotalTasks,
    memoizedGetDayCompletedTasks,
    memoizedGetDayTotalTasks,
    handleUpdateProgress,
    handleExportData,
    handleImportData,
    handleClearAllData,
    memoizedGetProgressSummary,
  ]);

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
};