"use client";

import { PageHeader } from "@/components/page-header";
import { OverdueSection } from "@/components/today/overdue-section";
import { TodayTasksSection } from "@/components/today/today-tasks-section";
import { FocusSuggestions } from "@/components/today/focus-suggestions";
import { HabitsToday } from "@/components/today/habits-today";
import { MorningSchedule } from "@/components/today/morning-schedule";
import { UpcomingEvents } from "@/components/today/upcoming-events";
import { TodaySkeleton } from "@/components/today/today-skeleton";
import { useAppStore } from "@/store/useAppStore";

export default function TodayPage() {
  const loaded = useAppStore((s) => s.loaded);

  return (
    <div>
      <PageHeader title="Today" description="今、何をすべきかだけを考える画面" />
      {!loaded ? (
        <TodaySkeleton />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
          <div className="order-2 space-y-6 lg:order-1">
            <HabitsToday />
          </div>
          <div className="order-1 space-y-6 lg:order-2">
            <OverdueSection />
            <TodayTasksSection />
            <FocusSuggestions />
          </div>
          <div className="order-3 space-y-6">
            <UpcomingEvents />
            <MorningSchedule />
          </div>
        </div>
      )}
    </div>
  );
}
