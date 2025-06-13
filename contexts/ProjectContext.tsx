'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { LocalProgressManager, UserProgress } from '@/lib/localStorage';

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
  getProgressSummary: () => ReturnType<typeof LocalProgressManager.getProgressSummary>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setTheme } = useTheme();
  const [userProgress, setUserProgress] = useState<UserProgress>(LocalProgressManager.loadProgress());
  const [tasksData, setTasksData] = useState<Record<string, string[]>>({});

  // Load tasks data
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

  // Sync theme with user preferences
  useEffect(() => {
    if (userProgress.preferences.theme) {
      setTheme(userProgress.preferences.theme);
    }
  }, [userProgress.preferences.theme, setTheme]);

  // Auto-save progress changes
  useEffect(() => {
    LocalProgressManager.saveProgress(userProgress);
  }, [userProgress]);

  const setCurrentDay = (day: number) => {
    setUserProgress(prev => ({ ...prev, currentDay: day }));
  };

  const toggleTask = (day: number, taskIndex: number) => {
    setUserProgress(prev => {
      const dayKey = day.toString();
      const dayTasks = prev.completedTasks[dayKey] || [];
      const newDayTasks = [...dayTasks];
      newDayTasks[taskIndex] = !newDayTasks[taskIndex];
      
      const newCompletedTasks = {
        ...prev.completedTasks,
        [dayKey]: newDayTasks
      };

      // Update daily stats
      const tasksCompleted = newDayTasks.filter(Boolean).length;
      const totalTasks = tasksData[dayKey]?.length || 0;
      LocalProgressManager.updateDailyStats(day, tasksCompleted, totalTasks);

      return {
        ...prev,
        completedTasks: newCompletedTasks
      };
    });
  };

  const updateProgress = (progress: Partial<UserProgress>) => {
    setUserProgress(prev => {
      const updated = { ...prev, ...progress };
      
      // If theme preference is updated, apply it immediately
      if (progress.preferences?.theme) {
        setTheme(progress.preferences.theme);
      }
      
      return updated;
    });
  };

  const getTotalCompletedTasks = () => {
    return Object.values(userProgress.completedTasks)
      .flat()
      .filter(Boolean).length;
  };

  const getTotalTasks = () => {
    return Object.values(tasksData).reduce((total, dayTasks) => total + dayTasks.length, 0);
  };

  const getDayCompletedTasks = (day: number) => {
    const dayKey = day.toString();
    const dayTasks = userProgress.completedTasks[dayKey] || [];
    return dayTasks.filter(Boolean).length;
  };

  const getDayTotalTasks = (day: number) => {
    const dayKey = day.toString();
    return tasksData[dayKey]?.length || 0;
  };

  const exportData = () => {
    return LocalProgressManager.exportProgress();
  };

  const importData = (data: string) => {
    const success = LocalProgressManager.importProgress(data);
    if (success) {
      const newProgress = LocalProgressManager.loadProgress();
      setUserProgress(newProgress);
      
      // Apply imported theme preference
      if (newProgress.preferences.theme) {
        setTheme(newProgress.preferences.theme);
      }
    }
    return success;
  };

  const clearAllData = () => {
    LocalProgressManager.clearAllData();
    const resetProgress = LocalProgressManager.loadProgress();
    setUserProgress(resetProgress);
    
    // Reset theme to system default
    setTheme('system');
  };

  const getProgressSummary = () => {
    return LocalProgressManager.getProgressSummary();
  };

  return (
    <ProjectContext.Provider
      value={{
        currentDay: userProgress.currentDay,
        setCurrentDay,
        completedTasks: userProgress.completedTasks,
        toggleTask,
        getTotalCompletedTasks,
        getTotalTasks,
        getDayCompletedTasks,
        getDayTotalTasks,
        userProgress,
        updateProgress,
        exportData,
        importData,
        clearAllData,
        getProgressSummary,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};