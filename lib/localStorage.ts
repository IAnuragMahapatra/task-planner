export interface UserProgress {
  completedTasks: Record<string, boolean[]>;
  currentDay: number;
  pomodoroSessions: {
    date: string;
    workSessions: number;
    breakSessions: number;
    totalFocusTime: number;
  }[];
  dailyStats: Record<string, {
    tasksCompleted: number;
    totalTasks: number;
    focusTime: number;
    lastUpdated: string;
    realDate: string; // Added real calendar date
  }>;
  preferences: {
    pomodoroWorkTime: number;
    pomodoroBreakTime: number;
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
  };
  achievements: string[];
  streaks: {
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // Real calendar date
    streakDates: string[]; // Array of consecutive dates
  };
  startDate: string; // When user started the project
}

const DEFAULT_PROGRESS: UserProgress = {
  completedTasks: {},
  currentDay: 1,
  pomodoroSessions: [],
  dailyStats: {},
  preferences: {
    pomodoroWorkTime: 1500,
    pomodoroBreakTime: 300,
    theme: 'system',
    notifications: true,
  },
  achievements: [],
  streaks: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    streakDates: [],
  },
  startDate: new Date().toISOString().split('T')[0],
};

export class LocalProgressManager {
  private static readonly STORAGE_KEY = 'project-tracker-progress';
  private static readonly BACKUP_KEY = 'project-tracker-backup';

  private static isClient(): boolean {
    return typeof window !== 'undefined';
  }

  static saveProgress(progress: Partial<UserProgress>): void {
    if (!this.isClient()) return;
    
    try {
      const currentProgress = this.loadProgress();
      const updatedProgress = { ...currentProgress, ...progress };
      
      // Create backup before saving
      this.createBackup(currentProgress);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedProgress));
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  static loadProgress(): UserProgress {
    if (!this.isClient()) return DEFAULT_PROGRESS;
    
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure startDate is set for existing users
        if (!parsed.startDate) {
          parsed.startDate = new Date().toISOString().split('T')[0];
        }
        // Ensure theme preference exists
        if (!parsed.preferences?.theme) {
          parsed.preferences = { ...parsed.preferences, theme: 'system' };
        }
        return { ...DEFAULT_PROGRESS, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
    return DEFAULT_PROGRESS;
  }

  static updateThemePreference(theme: 'light' | 'dark' | 'system'): void {
    if (!this.isClient()) return;
    
    try {
      const progress = this.loadProgress();
      progress.preferences.theme = theme;
      this.saveProgress(progress);
    } catch (error) {
      console.error('Failed to update theme preference:', error);
    }
  }

  static exportProgress(): string {
    const progress = this.loadProgress();
    return JSON.stringify(progress, null, 2);
  }

  static importProgress(progressData: string): boolean {
    if (!this.isClient()) return false;
    
    try {
      const parsed = JSON.parse(progressData);
      // Ensure theme preference exists in imported data
      if (!parsed.preferences?.theme) {
        parsed.preferences = { ...parsed.preferences, theme: 'system' };
      }
      this.saveProgress(parsed);
      return true;
    } catch (error) {
      console.error('Failed to import progress:', error);
      return false;
    }
  }

  static createBackup(progress?: UserProgress): void {
    if (!this.isClient()) return;
    
    try {
      const currentProgress = progress || this.loadProgress();
      const backup = {
        data: currentProgress,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  static restoreFromBackup(): boolean {
    if (!this.isClient()) return false;
    
    try {
      const backup = localStorage.getItem(this.BACKUP_KEY);
      if (backup) {
        const parsed = JSON.parse(backup);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(parsed.data));
        return true;
      }
    } catch (error) {
      console.error('Failed to restore from backup:', error);
    }
    return false;
  }

  static clearAllData(): void {
    if (!this.isClient()) return;
    
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.BACKUP_KEY);
  }

  static updateDailyStats(day: number, tasksCompleted: number, totalTasks: number, focusTime: number = 0): void {
    if (!this.isClient()) return;
    
    try {
      const progress = this.loadProgress();
      const today = new Date().toISOString().split('T')[0];
      
      progress.dailyStats[day.toString()] = {
        tasksCompleted,
        totalTasks,
        focusTime,
        lastUpdated: new Date().toISOString(),
        realDate: today,
      };
      
      // Update streaks when tasks are completed
      if (tasksCompleted > 0) {
        this.updateStreaks(progress);
      }
      
      this.saveProgress({ dailyStats: progress.dailyStats, streaks: progress.streaks });
    } catch (error) {
      console.error('Failed to update daily stats:', error);
    }
  }

  static addPomodoroSession(isWorkSession: boolean, duration: number): void {
    if (!this.isClient()) return;
    
    try {
      const progress = this.loadProgress();
      const today = new Date().toISOString().split('T')[0];
      
      let todaySession = progress.pomodoroSessions.find(s => s.date === today);
      if (!todaySession) {
        todaySession = {
          date: today,
          workSessions: 0,
          breakSessions: 0,
          totalFocusTime: 0,
        };
        progress.pomodoroSessions.push(todaySession);
      }

      if (isWorkSession) {
        todaySession.workSessions++;
        todaySession.totalFocusTime += duration;
        
        // Update streaks for pomodoro activity
        this.updateStreaks(progress);
      } else {
        todaySession.breakSessions++;
      }

      this.saveProgress({ pomodoroSessions: progress.pomodoroSessions, streaks: progress.streaks });
    } catch (error) {
      console.error('Failed to add pomodoro session:', error);
    }
  }

  static updateStreaks(progress: UserProgress): void {
    if (!this.isClient()) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastActive = progress.streaks.lastActiveDate;
      
      // Don't update if already active today
      if (lastActive === today) {
        return;
      }
      
      const todayDate = new Date(today);
      const lastActiveDate = lastActive ? new Date(lastActive) : null;
      
      if (lastActiveDate) {
        const daysDifference = Math.floor((todayDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference === 1) {
          // Consecutive day - continue streak
          progress.streaks.currentStreak++;
          progress.streaks.streakDates.push(today);
        } else if (daysDifference > 1) {
          // Gap in activity - reset streak
          progress.streaks.currentStreak = 1;
          progress.streaks.streakDates = [today];
        }
        // If daysDifference === 0, it's the same day (shouldn't happen due to check above)
      } else {
        // First time tracking
        progress.streaks.currentStreak = 1;
        progress.streaks.streakDates = [today];
      }
      
      // Update longest streak
      progress.streaks.longestStreak = Math.max(
        progress.streaks.longestStreak,
        progress.streaks.currentStreak
      );
      
      progress.streaks.lastActiveDate = today;
      
      // Keep only recent streak dates (last 30 days for performance)
      if (progress.streaks.streakDates.length > 30) {
        progress.streaks.streakDates = progress.streaks.streakDates.slice(-30);
      }
    } catch (error) {
      console.error('Failed to update streaks:', error);
    }
  }

  static getProgressSummary(): {
    totalTasksCompleted: number;
    totalDaysActive: number;
    totalFocusTime: number;
    currentStreak: number;
    longestStreak: number;
    daysSinceStart: number;
    activeDaysThisWeek: number;
    activeDaysThisMonth: number;
  } {
    if (!this.isClient()) {
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
    
    try {
      const progress = this.loadProgress();
      
      const totalTasksCompleted = Object.values(progress.completedTasks)
        .flat()
        .filter(Boolean).length;
      
      const totalDaysActive = Object.keys(progress.dailyStats).length;
      
      const totalFocusTime = progress.pomodoroSessions
        .reduce((total, session) => total + session.totalFocusTime, 0);
      
      // Calculate days since project start
      const startDate = new Date(progress.startDate);
      const today = new Date();
      const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate active days this week
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const activeDaysThisWeek = Object.values(progress.dailyStats)
        .filter(stat => stat.realDate >= weekStartStr).length;
      
      // Calculate active days this month
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthStartStr = monthStart.toISOString().split('T')[0];
      
      const activeDaysThisMonth = Object.values(progress.dailyStats)
        .filter(stat => stat.realDate >= monthStartStr).length;
      
      return {
        totalTasksCompleted,
        totalDaysActive,
        totalFocusTime,
        currentStreak: progress.streaks.currentStreak,
        longestStreak: progress.streaks.longestStreak,
        daysSinceStart: Math.max(0, daysSinceStart),
        activeDaysThisWeek,
        activeDaysThisMonth,
      };
    } catch (error) {
      console.error('Failed to get progress summary:', error);
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
  }

  static getStreakCalendar(): { date: string; active: boolean }[] {
    if (!this.isClient()) return [];
    
    try {
      const progress = this.loadProgress();
      const today = new Date();
      const calendar = [];
      
      // Get last 30 days
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const isActive = Object.values(progress.dailyStats)
          .some(stat => stat.realDate === dateStr && stat.tasksCompleted > 0) ||
          progress.pomodoroSessions.some(session => session.date === dateStr && session.workSessions > 0);
        
        calendar.push({
          date: dateStr,
          active: isActive,
        });
      }
      
      return calendar;
    } catch (error) {
      console.error('Failed to get streak calendar:', error);
      return [];
    }
  }
}