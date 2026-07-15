"use client";

import Link from "next/link";
import { History } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Card } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { countActivity, getActivityDates, getDayActivity } from "@/lib/review";
import { formatDateFullJP } from "@/lib/date";

export default function ReviewPage() {
  const tasks = useAppStore((s) => s.tasks);
  const projects = useAppStore((s) => s.projects);
  const habits = useAppStore((s) => s.habits);
  const habitLogs = useAppStore((s) => s.habitLogs);

  const dates = getActivityDates(tasks, projects, habitLogs);

  return (
    <div>
      <PageHeader title="振り返り" description="日ごとに、目標・プロジェクト・タスク・習慣をどれだけ進められたか振り返る" />
      {dates.length === 0 ? (
        <EmptyState
          icon={History}
          title="まだ記録がありません"
          description="タスクや習慣を完了すると、ここに記録されていきます"
        />
      ) : (
        <div className="space-y-6">
          {dates.map((date) => {
            const activity = getDayActivity(date, tasks, projects, habits, habitLogs);
            return (
              <Link key={date} href={`/review/${date}`}>
                <Card className="flex items-center justify-between p-5 transition-colors hover:bg-secondary/40">
                  <span className="text-sm font-medium">{formatDateFullJP(date)}</span>
                  <span className="text-xs text-muted-foreground">{countActivity(activity)}</span>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
