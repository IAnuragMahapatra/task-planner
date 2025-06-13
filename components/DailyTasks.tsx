'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { CheckCircle, Circle, ListTodo, Calendar, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const DailyTasks: React.FC = () => {
  const { currentDay, completedTasks, toggleTask } = useProject();
  const [tasks, setTasks] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/data/tasksData.json');
        const tasksData = await response.json();
        setTasks(tasksData[currentDay.toString()] || []);
      } catch (error) {
        console.error('Error loading tasks:', error);
        setTasks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTasks();
  }, [currentDay]);

  const dayCompletedTasks = completedTasks[currentDay.toString()] || [];
  const completedCount = dayCompletedTasks.filter(Boolean).length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-32"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <ListTodo className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            Daily Tasks
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
              <Calendar className="w-3 h-3 mr-1" />
              Day {currentDay}
            </Badge>
            <Badge 
              variant={completionPercentage === 100 ? "default" : "outline"}
              className={completionPercentage === 100 ? "bg-green-500 hover:bg-green-600" : ""}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {completionPercentage}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No tasks scheduled</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">for Day {currentDay}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task, index) => {
              const isCompleted = dayCompletedTasks[index] || false;
              
              return (
                <div
                  key={index}
                  className={`group flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-md ${
                    isCompleted 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30' 
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => toggleTask(currentDay, index)}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-500 transition-transform group-hover:scale-110" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-400 transition-all group-hover:text-slate-600 group-hover:scale-110" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium leading-relaxed transition-all ${
                      isCompleted 
                        ? 'text-green-700 dark:text-green-300 line-through opacity-75' 
                        : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}>
                      {task}
                    </p>
                  </div>
                  {isCompleted && (
                    <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs">
                      ✓ Done
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {tasks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Progress: {completedCount} of {tasks.length} completed
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
                <span className="font-medium text-slate-700 dark:text-slate-300 min-w-[3rem] text-right">
                  {completionPercentage}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};