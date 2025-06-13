'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const MIN_DAY = 1;
const TOTAL_DAYS = 110;
const MIDPOINT_DAY = Math.floor(TOTAL_DAYS / 2);

export const DayNavigator: React.FC = () => {
  const { currentDay, setCurrentDay } = useProject();
  const [jumpDayInput, setJumpDayInput] = useState('');

  const isValidJumpDay = useCallback((input: string): number | null => {
    const day = parseInt(input, 10);
    if (isNaN(day) || day < MIN_DAY || day > TOTAL_DAYS) {
      return null;
    }
    return day;
  }, []);

  const handlePrevDay = useCallback(() => {
    if (currentDay > MIN_DAY) {
      setCurrentDay(currentDay - 1);
    }
  }, [currentDay, setCurrentDay]);

  const handleNextDay = useCallback(() => {
    if (currentDay < TOTAL_DAYS) {
      setCurrentDay(currentDay + 1);
    }
  }, [currentDay, setCurrentDay]);

  const handleJumpToDay = useCallback(() => {
    const day = isValidJumpDay(jumpDayInput);
    if (day !== null) {
      setCurrentDay(day);
      setJumpDayInput('');
    }
  }, [jumpDayInput, setCurrentDay, isValidJumpDay]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToDay();
    }
  }, [handleJumpToDay]);

  const progressPercentage = useMemo(() => {
    return Math.round((currentDay / TOTAL_DAYS) * 100);
  }, [currentDay]);

  const isJumpButtonDisabled = useMemo(() => {
    return isValidJumpDay(jumpDayInput) === null;
  }, [jumpDayInput, isValidJumpDay]);

  return (
    <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Day Navigation
          </CardTitle>
          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-700/50">
            <MapPin className="w-3 h-3 mr-1" />
            {progressPercentage}% Progress
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="relative">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Day {currentDay}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              of {TOTAL_DAYS} total days
            </div>
            
            <div
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Project progress"
              className="mt-4 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"
            >
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrevDay}
            disabled={currentDay <= MIN_DAY}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNextDay}
            disabled={currentDay >= TOTAL_DAYS}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="jump-day-input" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Jump to specific day
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="jump-day-input"
              type="number"
              placeholder={`Enter day (${MIN_DAY}-${TOTAL_DAYS})`}
              value={jumpDayInput}
              onChange={(e) => setJumpDayInput(e.target.value)}
              onKeyPress={handleKeyPress}
              min={MIN_DAY}
              max={TOTAL_DAYS}
              className="flex-1 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400"
            />
            <Button 
              onClick={handleJumpToDay} 
              size="sm"
              disabled={isJumpButtonDisabled}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              Jump
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDay(MIN_DAY)}
            className="text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Start
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDay(MIDPOINT_DAY)}
            className="text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Midpoint
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDay(TOTAL_DAYS)}
            className="text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            End
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};