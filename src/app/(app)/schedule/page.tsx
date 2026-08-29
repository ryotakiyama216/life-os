"use client";

import { useState } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { EventFormDialog } from "@/components/event/event-form-dialog";
import { EventRow } from "@/components/event/event-row";
import { useAppStore } from "@/store/useAppStore";
import { isOverdue } from "@/lib/date";

export default function SchedulePage() {
  const allEvents = useAppStore((s) => s.events);
  const [showPast, setShowPast] = useState(false);

  const sorted = [...allEvents].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((e) => !isOverdue(e.date));
  const past = sorted.filter((e) => isOverdue(e.date));
  const events = showPast ? [...past].reverse().concat(upcoming) : upcoming;

  return (
    <div>
      <PageHeader
        title="予定"
        description="通院や美容室など、不定期に発生する単発の予定を管理します"
        count={events.length}
        action={
          <EventFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3.5" />
                予定を追加
              </Button>
            }
          />
        }
      />
      {sorted.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="予定がまだありません"
          description="通院や美容室などの単発の予定を登録すると、Todayページ上部にも表示されます"
        />
      ) : (
        <>
          {past.length > 0 && (
            <div className="mb-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => setShowPast((v) => !v)}
              >
                {showPast ? "過去の予定を隠す" : `過去の予定を表示（${past.length}件）`}
              </Button>
            </div>
          )}
          {events.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="今後の予定はありません"
              description="過去の予定はありますが、一覧からは非表示になっています"
            />
          ) : (
            <div className="space-y-2.5">
              {events.map((e) => (
                <EventRow key={e.id} event={e} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
