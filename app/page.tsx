'use client';

import { ProjectProvider } from '@/contexts/ProjectContext';
import { PhaseBadge } from '@/components/PhaseBadge';
import { DayNavigator } from '@/components/DayNavigator';
import { DailyTasks } from '@/components/DailyTasks';
import { ProgressDashboard } from '@/components/ProgressDashboard';
import { PomodoroTimer } from '@/components/PomodoroTimer';
import { FocusSchedule } from '@/components/FocusSchedule';
import { PhaseTimeline } from '@/components/PhaseTimeline';
import { ProgressStats } from '@/components/ProgressStats';
import { Header } from '@/components/Header';

export default function Home() {
  return (
    <ProjectProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Header />

          {/* Phase and Navigation Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <PhaseBadge />
            </div>
            <div>
              <DayNavigator />
            </div>
          </section>

          {/* Main Content Section */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <DailyTasks />
              <PomodoroTimer />
            </div>
            <div className="space-y-6">
              <ProgressDashboard />
              <FocusSchedule />
            </div>
          </section>

          {/* Analytics Section */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <PhaseTimeline />
            <ProgressStats />
          </section>
        </div>
      </div>
    </ProjectProvider>
  );
}