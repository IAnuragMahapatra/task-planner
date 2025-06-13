'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Baseline, CheckCircle, Clock, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as Icons from 'lucide-react';

// Create Timeline alias for Baseline
const Timeline = Baseline;

interface Phase {
  title: string;
  days: [number, number];
  icon: string;
  gradient: string;
  color: string;
  klos: string[];
  deliverables: string[];
}

export const PhaseTimeline: React.FC = () => {
  const { currentDay } = useProject();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPhases = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/data/phasesData.json');
        const data = await response.json();
        setPhases(Object.values(data));
      } catch (error) {
        console.error('Error loading phases:', error);
        setPhases([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhases();
  }, []);

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
              <div key={i} className="h-20 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
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
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
            <Timeline className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          Project Timeline
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {phases.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Timeline className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">No timeline data available</p>
          </div>
        ) : (
          <div className="space-y-6">
            {phases.map((phase, index) => {
              const IconComponent = Icons[phase.icon as keyof typeof Icons] as React.ComponentType<any>;
              const isActive = currentDay >= phase.days[0] && currentDay <= phase.days[1];
              const isCompleted = currentDay > phase.days[1];
              const isUpcoming = currentDay < phase.days[0];
              
              const phaseProgress = isActive 
                ? ((currentDay - phase.days[0]) / (phase.days[1] - phase.days[0] + 1)) * 100
                : isCompleted ? 100 : 0;
              
              return (
                <div key={index} className="relative">
                  {/* Timeline connector */}
                  {index < phases.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-8 bg-slate-200 dark:bg-slate-700"></div>
                  )}
                  
                  <div
                    className={`relative p-5 rounded-xl border-2 transition-all duration-300 ${
                      isActive 
                        ? 'border-indigo-300 dark:border-indigo-600 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 shadow-lg' 
                        : isCompleted
                        ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
                        : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Phase Icon */}
                      <div className={`flex-shrink-0 p-3 rounded-xl shadow-md ${
                        isActive 
                          ? 'bg-gradient-to-br from-indigo-500 to-blue-600' 
                          : isCompleted
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : 'bg-gradient-to-br from-slate-400 to-slate-500'
                      }`}>
                        {IconComponent && <IconComponent className="w-5 h-5 text-white" />}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* Phase Header */}
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                            {phase.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="secondary" 
                              className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                              <Calendar className="w-3 h-3 mr-1" />
                              Days {phase.days[0]}-{phase.days[1]}
                            </Badge>
                            {isActive && (
                              <Badge className="bg-indigo-600 hover:bg-indigo-700">
                                <Clock className="w-3 h-3 mr-1" />
                                Active
                              </Badge>
                            )}
                            {isCompleted && (
                              <Badge className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Complete
                              </Badge>
                            )}
                            {isUpcoming && (
                              <Badge variant="outline">
                                <Clock className="w-3 h-3 mr-1" />
                                Upcoming
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Bar for Active Phase */}
                        {isActive && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
                              <span>Phase Progress</span>
                              <span>{Math.round(phaseProgress)}%</span>
                            </div>
                            <Progress value={phaseProgress} className="h-2" />
                          </div>
                        )}
                        
                        {/* Phase Details */}
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Key Learning Objectives
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                              {phase.klos[0]}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                              Expected Deliverables
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                              {phase.deliverables[0]}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Active Phase Indicator */}
                    {isActive && (
                      <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-12 bg-gradient-to-b from-indigo-500 to-blue-600 rounded-r shadow-md"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};