'use client';

import React from 'react';
import { BookOpen, Target } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export const Header: React.FC = () => {
  return (
    <header className="relative mb-10">
      {/* Theme Toggle - Positioned absolutely in top right */}
      <div className="absolute top-0 right-0 z-10">
        <ThemeToggle />
      </div>
      
      {/* Main Header Content */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
            <Target className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent">
            Project Tracker
          </h1>
        </div>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Structured learning path with comprehensive progress tracking, focus management, and productivity insights
        </p>
        <div className="flex items-center justify-center gap-2 mt-4 text-sm text-slate-500 dark:text-slate-400">
          <BookOpen className="w-4 h-4" />
          <span>Your journey to mastery starts here</span>
        </div>
      </div>
    </header>
  );
};