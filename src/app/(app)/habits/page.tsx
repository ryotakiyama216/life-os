"use client";

import { Plus, Repeat } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { HabitFormDialog } from "@/components/habit/habit-form-dialog";
import { HabitRow } from "@/components/habit/habit-row";
import { useAppStore } from "@/store/useAppStore";
import { sortHabitsByTime } from "@/lib/habit";

export default function HabitsPage() {
  const habits = sortHabitsByTime(useAppStore((s) => s.habits));

  return (
    <div>
      <PageHeader
        title="習慣"
        description="日々の積み重ねで目標に近づく。今日の習慣はTodayページに自動で表示されます"
        action={
          <HabitFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                習慣を追加
              </Button>
            }
          />
        }
      />
      {habits.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title="習慣がまだありません"
          description="毎日/毎週続けたいことを登録すると、Todayページに自動表示されます"
        />
      ) : (
        <div className="space-y-2.5">
          {habits.map((h) => (
            <HabitRow key={h.id} habit={h} />
          ))}
        </div>
      )}
    </div>
  );
}
