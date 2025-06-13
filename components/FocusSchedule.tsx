'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Clock, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import * as Icons from 'lucide-react';

interface ScheduleItem {
  time: string;
  activity: string;
  description: string;
  icon: string;
  color: string;
}

export const FocusSchedule: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [isClient, setIsClient] = useState(false);
  const timerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  // Cleanup function to safely clear intervals
  const clearTimeInterval = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const loadSchedule = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/data/dailyScheduleData.json');
        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        console.error('Error loading schedule:', error);
        setSchedule([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSchedule();
  }, []);

  useEffect(() => {
    // Set client-side flag and initial time
    setIsClient(true);
    setCurrentTime(new Date());
    
    // Clear any existing timer before creating a new one
    clearTimeInterval();
    
    timerRef.current = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    // Cleanup on unmount or dependency change
    return () => {
      clearTimeInterval();
    };
  }, [clearTimeInterval]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearTimeInterval();
    };
  }, [clearTimeInterval]);

  const getCurrentTimeSlot = () => {
    if (!currentTime) return null;
    
    const now = currentTime.getHours() * 100 + currentTime.getMinutes();
    
    for (const item of schedule) {
      const [startTime] = item.time.split('-');
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const startTimeNum = startHour * 100 + (startMinute || 0);
      
      if (now >= startTimeNum && now < startTimeNum + 300) { // Within 3 hours
        return item;
      }
    }
    return null;
  };

  const currentSlot = getCurrentTimeSlot();

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-32"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-slate-900 dark:text-white">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            Daily Focus Schedule
          </CardTitle>
          <Badge variant="outline" className="bg-slate-50 dark:bg-slate-700/50">
            <Calendar className="w-3 h-3 mr-1" />
            {isClient && currentTime ? currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {schedule.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No schedule available</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Check back later for updates</p>
          </div>
        ) : (
          <div className="space-y-4">
            {schedule.map((item, index) => {
              const IconComponent = Icons[item.icon as keyof typeof Icons] as React.ComponentType<any>;
              const isCurrentSlot = currentSlot?.time === item.time;
              
              return (
                <div 
                  key={index} 
                  className={`group relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                    isCurrentSlot
                      ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-700 shadow-md'
                      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {isCurrentSlot && (
                    <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r"></div>
                  )}
                  
                  <div className={`flex-shrink-0 p-3 rounded-xl transition-all ${
                    isCurrentSlot 
                      ? 'bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg' 
                      : 'bg-slate-200 dark:bg-slate-600 group-hover:bg-slate-300 dark:group-hover:bg-slate-500'
                  }`}>
                    {IconComponent && (
                      <IconComponent className={`w-5 h-5 ${
                        isCurrentSlot ? 'text-white' : item.color
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold transition-colors ${
                        isCurrentSlot 
                          ? 'text-purple-900 dark:text-purple-100' 
                          : 'text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200'
                      }`}>
                        {item.activity}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={isCurrentSlot ? "default" : "secondary"}
                          className={`text-xs ${
                            isCurrentSlot 
                              ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                              : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.time}
                        </Badge>
                        {isCurrentSlot && (
                          <Badge variant="outline" className="text-xs border-purple-300 text-purple-700 dark:text-purple-300">
                            <ArrowRight className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className={`text-sm leading-relaxed ${
                      isCurrentSlot 
                        ? 'text-purple-700 dark:text-purple-300' 
                        : 'text-slate-600 dark:text-slate-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {schedule.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Schedule updates automatically • Current time: {isClient && currentTime ? currentTime.toLocaleTimeString() : '--:--:--'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};