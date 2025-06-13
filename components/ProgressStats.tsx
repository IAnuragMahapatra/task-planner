'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Trophy, Flame, Clock, Target, Download, Upload, Trash2, Calendar, TrendingUp, Activity, Award, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LocalProgressManager } from '@/lib/localStorage';

export const ProgressStats: React.FC = () => {
  const { getProgressSummary, exportData, importData, clearAllData } = useProject();
  const [stats, setStats] = useState<ReturnType<typeof getProgressSummary> | null>(null);
  const [streakCalendar, setStreakCalendar] = useState<{ date: string; active: boolean }[]>([]);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure client-side only rendering
  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
    
    try {
      setStats(getProgressSummary());
      setStreakCalendar(LocalProgressManager.getStreakCalendar());
    } catch (error) {
      console.error('Error loading progress stats:', error);
    }
  }, [getProgressSummary]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleExport = () => {
    try {
      const data = exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleImport = () => {
    try {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = e.target?.result as string;
            const success = importData(data);
            if (success) {
              alert('Data imported successfully!');
              window.location.reload();
            } else {
              alert('Failed to import data. Please check the file format.');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    } catch (error) {
      console.error('Error importing data:', error);
    }
  };

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all progress data? This action cannot be undone.')) {
      try {
        clearAllData();
        alert('All data has been cleared.');
        window.location.reload();
      } catch (error) {
        console.error('Error clearing data:', error);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'from-purple-500 to-pink-500';
    if (streak >= 14) return 'from-blue-500 to-indigo-500';
    if (streak >= 7) return 'from-green-500 to-emerald-500';
    if (streak >= 3) return 'from-yellow-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  // Show loading state during hydration
  if (!isClient || !stats || !currentTime) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            Progress Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          Progress Analytics
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <Target className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
            <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
              {stats.totalTasksCompleted}
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
              Tasks Done
            </div>
          </div>
          
          <div className={`text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800`}>
            <Flame className="w-6 h-6 mx-auto mb-2 text-orange-600 dark:text-orange-400" />
            <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
              {stats.currentStreak}
            </div>
            <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">
              Day Streak
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
            <Clock className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
            <div className="text-2xl font-bold text-green-900 dark:text-green-100">
              {formatTime(stats.totalFocusTime)}
            </div>
            <div className="text-xs text-green-700 dark:text-green-300 font-medium">
              Focus Time
            </div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
            <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {stats.daysSinceStart}
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">
              Days Active
            </div>
          </div>
        </div>

        {/* Streak Achievement */}
        {stats.currentStreak > 0 && (
          <div className={`p-4 bg-gradient-to-r ${getStreakColor(stats.currentStreak)} rounded-xl text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6" />
                <div>
                  <div className="font-semibold">
                    {stats.currentStreak >= 30 ? 'Legendary Streak!' : 
                     stats.currentStreak >= 14 ? 'Amazing Streak!' :
                     stats.currentStreak >= 7 ? 'Great Streak!' :
                     stats.currentStreak >= 3 ? 'Good Streak!' : 'Building Momentum!'}
                  </div>
                  <div className="text-sm opacity-90">
                    {stats.currentStreak} consecutive days
                  </div>
                </div>
              </div>
              <Zap className="w-8 h-8 opacity-80" />
            </div>
          </div>
        )}

        {/* Activity Heatmap */}
        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Heatmap
            </h3>
            <Badge variant="outline" className="bg-white dark:bg-slate-600">
              Last 4 weeks
            </Badge>
          </div>
          
          {/* Calendar Grid */}
          <div className="mb-4">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-xs text-center text-slate-500 dark:text-slate-400 font-medium">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {streakCalendar.slice(-28).map((day, index) => {
                const date = new Date(day.date);
                
                return (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded-md border transition-all duration-200 cursor-pointer
                      hover:scale-110 hover:shadow-md relative group
                      ${day.active 
                        ? 'bg-green-500 dark:bg-green-400 border-green-600 dark:border-green-300 shadow-sm' 
                        : 'bg-slate-200 dark:bg-slate-600 border-slate-300 dark:border-slate-500'
                      }
                    `}
                    title={`${formatDate(day.date)} - ${day.active ? 'Active Day' : 'No Activity'}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-xs font-medium ${
                        day.active ? 'text-white' : 'text-slate-600 dark:text-slate-300'
                      }`}>
                        {date.getDate()}
                      </span>
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {formatDate(day.date)}
                      <br />
                      {day.active ? '✅ Active' : '❌ Inactive'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="w-3 h-3 bg-slate-200 dark:bg-slate-600 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-300 dark:bg-green-500 rounded-sm"></div>
              <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-sm"></div>
              <span>More</span>
            </div>
            <span>Activity level</span>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.longestStreak}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Best Streak
            </div>
          </div>
          
          <div className="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
            <div className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.totalDaysActive}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Active
            </div>
          </div>
        </div>

        {/* Weekly/Monthly Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {stats.activeDaysThisWeek}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400">
              Active This Week
            </div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {stats.activeDaysThisMonth}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400">
              Active This Month
            </div>
          </div>
        </div>
        
        {/* Data Management */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
            Data Management
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleExport} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Download className="w-4 h-4" />
              Export Data
            </Button>
            <Button 
              onClick={handleImport} 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Upload className="w-4 h-4" />
              Import Data
            </Button>
            <Button 
              onClick={handleClearData} 
              variant="destructive" 
              size="sm" 
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </Button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            All data is stored locally in your browser • Export regularly for backup
          </p>
        </div>
      </CardContent>
    </Card>
  );
};