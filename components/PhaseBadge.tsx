'use client';

import React, { useState, useEffect } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import * as Icons from 'lucide-react';

interface Phase {
  title: string;
  days: [number, number];
  icon: string;
  gradient: string;
  color: string;
  klos: string[];
  deliverables: string[];
}

export const PhaseBadge: React.FC = () => {
  const { currentDay } = useProject();
  const [currentPhase, setCurrentPhase] = useState<Phase | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPhase = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/data/phasesData.json');
        const phasesData = await response.json();
        
        const phase = Object.values(phasesData).find((p: any) => 
          currentDay >= p.days[0] && currentDay <= p.days[1]
        ) as Phase;
        
        setCurrentPhase(phase);
      } catch (error) {
        console.error('Error loading phases data:', error);
        setCurrentPhase(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPhase();
  }, [currentDay]);

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  if (!currentPhase) {
    return (
      <Card className="shadow-lg border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No phase data available for Day {currentDay}</p>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = Icons[currentPhase.icon as keyof typeof Icons] as React.ComponentType<any>;
  const phaseProgress = ((currentDay - currentPhase.days[0]) / (currentPhase.days[1] - currentPhase.days[0] + 1)) * 100;
  const daysRemaining = currentPhase.days[1] - currentDay + 1;


  const progressIndicatorClass = `bg-${currentPhase.color}-500`; 

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-gradient-to-br ${currentPhase.gradient} rounded-xl shadow-lg`}>
              {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900 dark:text-white mb-1">
                {currentPhase.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-700">
                  Days {currentPhase.days[0]} - {currentPhase.days[1]}
                </Badge>
                <Badge variant="outline" className={`border-${currentPhase.color}-200 text-${currentPhase.color}-700 dark:text-${currentPhase.color}-300`}>
                  {daysRemaining} days left
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {Math.round(phaseProgress)}%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Complete
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
            <span>Phase Progress</span>
            <span>{Math.round(phaseProgress)}%</span>
          </div>
          <Progress 
            value={phaseProgress} 
            className="h-2"
            indicatorClassName={progressIndicatorClass}
          />
        </div>

        {/* Key Learning Objectives */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Key Learning Objectives
          </h4>
          <div className="space-y-1">
            {currentPhase.klos.map((klo, index) => (
              <p key={index} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                • {klo}
              </p>
            ))}
          </div>
        </div>

        {/* Deliverables */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Expected Deliverables
          </h4>
          <div className="space-y-1">
            {currentPhase.deliverables.map((deliverable, index) => (
              <p key={index} className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                • {deliverable}
              </p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};