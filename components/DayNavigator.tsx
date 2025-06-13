'use client';

import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const DayNavigator: React.FC = () => {
  const { currentDay, setCurrentDay } = useProject();
  const [jumpDay, setJumpDay] = useState('');

  const handlePrevDay = () => {
    if (currentDay > 1) {
      setCurrentDay(currentDay - 1);
    }
  };

  const handleNextDay = () => {
    if (currentDay < 110) {
      setCurrentDay(currentDay + 1);
    }
  };

  const handleJumpToDay = () => {
    const day = parseInt(jumpDay);
    if (day >= 1 && day <= 110) {
      setCurrentDay(day);
      setJumpDay('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleJumpToDay();
    }
  };

  const progressPercentage = Math.round((currentDay / 110) * 100);

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
            {progressPercentage}% Complete
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Day Display */}
        <div className="text-center">
          <div className="relative">
            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              Day {currentDay}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              of 110 total days
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Navigation Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePrevDay}
            disabled={currentDay <= 1}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNextDay}
            disabled={currentDay >= 110}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Jump to Day */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Jump to specific day
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Enter day (1-110)"
              value={jumpDay}
              onChange={(e) => setJumpDay(e.target.value)}
              onKeyPress={handleKeyPress}
              min="1"
              max="110"
              className="flex-1 bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 focus:border-indigo-500 dark:focus:border-indigo-400"
            />
            <Button 
              onClick={handleJumpToDay} 
              size="sm"
              disabled={!jumpDay || parseInt(jumpDay) < 1 || parseInt(jumpDay) > 110}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              Jump
            </Button>
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDay(1)}
            className="text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Start
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDay(55)}
            className="text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            Midpoint
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDay(110)}
            className="text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            End
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};