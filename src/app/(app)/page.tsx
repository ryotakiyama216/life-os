import { PageHeader } from "@/components/page-header";
import { OverdueSection } from "@/components/today/overdue-section";
import { TodayTasksSection } from "@/components/today/today-tasks-section";
import { FocusSuggestions } from "@/components/today/focus-suggestions";
import { HabitsToday } from "@/components/today/habits-today";
import { MorningSchedule } from "@/components/today/morning-schedule";

export default function TodayPage() {
  return (
    <div>
      <PageHeader title="Today" description="今、何をすべきかだけを考える画面" />
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <HabitsToday />
        </div>
        <div className="space-y-6">
          <OverdueSection />
          <TodayTasksSection />
          <FocusSuggestions />
        </div>
        <div className="space-y-6">
          <MorningSchedule />
        </div>
      </div>
    </div>
  );
}
