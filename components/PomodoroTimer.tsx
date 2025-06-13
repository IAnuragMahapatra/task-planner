'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, Zap, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ProgressRing } from './ProgressRing';
import { useProject } from '@/contexts/ProjectContext';
import { LocalProgressManager } from '@/lib/localStorage';

interface PomodoroConfig {
  pomodoroWorkTime: number;
  pomodoroBreakTime: number;
}

export const PomodoroTimer: React.FC = () => {
  const { userProgress } = useProject();
  const [config, setConfig] = useState<PomodoroConfig>({ 
    pomodoroWorkTime: userProgress.preferences.pomodoroWorkTime, 
    pomodoroBreakTime: userProgress.preferences.pomodoroBreakTime 
  });
  const [isRunning, setIsRunning] = useState(false);
  const [isWorkSession, setIsWorkSession] = useState(true);
  const [timeLeft, setTimeLeft] = useState(userProgress.preferences.pomodoroWorkTime);
  const [sessionCount, setSessionCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionStartTime = useRef<number>(0);

  // Cleanup function to safely clear intervals
  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/data/projectConfig.json');
        const data = await response.json();
        setConfig(data);
        setTimeLeft(data.pomodoroWorkTime);
      } catch (error) {
        console.error('Error loading config:', error);
      }
    };

    loadConfig();
  }, []);

  useEffect(() => {
    if (isRunning) {
      sessionStartTime.current = Date.now();
      
      // Clear any existing interval before creating a new one
      clearTimerInterval();
      
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            
            // Record completed session
            const sessionDuration = isWorkSession ? config.pomodoroWorkTime : config.pomodoroBreakTime;
            try {
              LocalProgressManager.addPomodoroSession(isWorkSession, sessionDuration);
            } catch (error) {
              console.error('Error recording pomodoro session:', error);
            }
            
            if (isWorkSession) {
              setSessionCount(prev => prev + 1);
            }
            
            // Switch session type when timer completes
            const newIsWorkSession = !isWorkSession;
            setIsWorkSession(newIsWorkSession);
            return newIsWorkSession ? config.pomodoroWorkTime : config.pomodoroBreakTime;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearTimerInterval();
    }

    // Cleanup on unmount or dependency change
    return () => {
      clearTimerInterval();
    };
  }, [isRunning, isWorkSession, config, clearTimerInterval]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, [clearTimerInterval]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = useCallback(() => {
    setIsRunning(true);
  }, []);
  
  const handlePause = useCallback(() => {
    setIsRunning(false);
    // Record partial session time if it was a work session
    if (isWorkSession && sessionStartTime.current > 0) {
      const partialTime = Math.floor((Date.now() - sessionStartTime.current) / 1000);
      try {
        LocalProgressManager.addPomodoroSession(true, partialTime);
      } catch (error) {
        console.error('Error recording partial pomodoro session:', error);
      }
    }
  }, [isWorkSession]);
  
  const handleReset = useCallback(() => {
    setIsRunning(false);
    clearTimerInterval();
    setTimeLeft(isWorkSession ? config.pomodoroWorkTime : config.pomodoroBreakTime);
  }, [isWorkSession, config, clearTimerInterval]);

  const handleSessionSwitch = useCallback(() => {
    setIsRunning(false);
    clearTimerInterval();
    const newIsWorkSession = !isWorkSession;
    setIsWorkSession(newIsWorkSession);
    setTimeLeft(newIsWorkSession ? config.pomodoroWorkTime : config.pomodoroBreakTime);
  }, [isWorkSession, config, clearTimerInterval]);

  const maxTime = isWorkSession ? config.pomodoroWorkTime : config.pomodoroBreakTime;
  const progress = ((maxTime - timeLeft) / maxTime) * 100;

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className={`p-2 rounded-lg ${isWorkSession ? 'bg-red-100 dark:bg-red-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
              {isWorkSession ? (
                <Zap className="w-5 h-5 text-red-600 dark:text-red-400" />
              ) : (
                <Coffee className="w-5 h-5 text-green-600 dark:text-green-400" />
              )}
            </div>
            Pomodoro Timer
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-slate-50 dark:bg-slate-700/50">
              Sessions: {sessionCount}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSessionSwitch}
              className="p-2"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Session Type Indicator */}
        <div className="text-center">
          <Badge 
            variant={isWorkSession ? "destructive" : "default"}
            className={`text-sm font-medium px-4 py-2 ${
              isWorkSession 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isWorkSession ? (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Focus Session
              </>
            ) : (
              <>
                <Coffee className="w-4 h-4 mr-2" />
                Break Time
              </>
            )}
          </Badge>
        </div>
        
        {/* Timer Display */}
        <div className="flex justify-center">
          <ProgressRing
            progress={progress}
            size={180}
            strokeWidth={12}
            color={isWorkSession ? '#ef4444' : '#10b981'}
          />
        </div>
        
        <div className="text-center">
          <div className="text-5xl font-mono font-bold text-slate-900 dark:text-white mb-2">
            {formatTime(timeLeft)}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isWorkSession ? 'Stay focused and productive' : 'Take a well-deserved break'}
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!isRunning ? (
            <Button 
              onClick={handleStart} 
              className={`flex items-center gap-2 px-6 ${
                isWorkSession 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          ) : (
            <Button 
              onClick={handlePause} 
              variant="outline" 
              className="flex items-center gap-2 px-6 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Pause className="w-4 h-4" />
              Pause
            </Button>
          )}
          
          <Button 
            onClick={handleReset} 
            variant="outline" 
            className="flex items-center gap-2 px-6 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {/* Session Info */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {Math.floor(config.pomodoroWorkTime / 60)}m
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Work</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-slate-900 dark:text-white">
              {Math.floor(config.pomodoroBreakTime / 60)}m
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Break</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};