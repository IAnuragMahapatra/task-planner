'use client';

import React from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ProgressRing } from './ProgressRing';
import { Target, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const ProgressDashboard: React.FC = () => {
  const { 
    currentDay, 
    getTotalCompletedTasks, 
    getTotalTasks, 
    getDayCompletedTasks, 
    getDayTotalTasks 
  } = useProject();

  const totalCompleted = getTotalCompletedTasks();
  const totalTasks = getTotalTasks();
  const overallProgress = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  const dayCompleted = getDayCompletedTasks(currentDay);
  const dayTotal = getDayTotalTasks(currentDay);
  const dayProgress = dayTotal > 0 ? (dayCompleted / dayTotal) * 100 : 0;

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return '#10b981'; // green
    if (progress >= 60) return '#f59e0b'; // amber
    if (progress >= 40) return '#3b82f6'; // blue
    return '#6b7280'; // gray
  };

  const getProgressStatus = (progress: number) => {
    if (progress === 100) return { text: 'Complete', variant: 'default' as const, icon: CheckCircle };
    if (progress >= 80) return { text: 'Excellent', variant: 'default' as const, icon: Award };
    if (progress >= 60) return { text: 'Good', variant: 'secondary' as const, icon: TrendingUp };
    if (progress >= 40) return { text: 'Fair', variant: 'outline' as const, icon: Target };
    return { text: 'Getting Started', variant: 'outline' as const, icon: Target };
  };

  const overallStatus = getProgressStatus(overallProgress);
  const dayStatus = getProgressStatus(dayProgress);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Progress */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-900 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              Overall Progress
            </div>
            <Badge variant={overallStatus.variant} className="flex items-center gap-1">
              <overallStatus.icon className="w-3 h-3" />
              {overallStatus.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <ProgressRing
              progress={overallProgress}
              size={120}
              strokeWidth={8}
              color={getProgressColor(overallProgress)}
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">{totalCompleted}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{totalTasks}</span> tasks completed
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <span>Project-wide completion rate</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Progress */}
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between text-slate-900 dark:text-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              Today's Progress
            </div>
            <Badge variant={dayStatus.variant} className="flex items-center gap-1">
              <dayStatus.icon className="w-3 h-3" />
              {dayStatus.text}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            <ProgressRing
              progress={dayProgress}
              size={120}
              strokeWidth={8}
              color={getProgressColor(dayProgress)}
            />
          </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">{dayCompleted}</span> of{' '}
              <span className="font-semibold text-slate-900 dark:text-white">{dayTotal}</span> tasks completed
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span>Day {currentDay} completion rate</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};