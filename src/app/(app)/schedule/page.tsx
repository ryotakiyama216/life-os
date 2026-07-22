"use client";

import { CalendarDays, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { EventFormDialog } from "@/components/event/event-form-dialog";
import { EventRow } from "@/components/event/event-row";
import { useAppStore } from "@/store/useAppStore";

export default function SchedulePage() {
  const allEvents = useAppStore((s) => s.events);
  const events = [...allEvents].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <PageHeader
        title="予定"
        description="通院や美容室など、不定期に発生する単発の予定を管理します"
        action={
          <EventFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                予定を追加
              </Button>
            }
          />
        }
      />
      {events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="予定がまだありません"
          description="通院や美容室などの単発の予定を登録すると、Todayページ上部にも表示されます"
        />
      ) : (
        <div className="space-y-2.5">
          {events.map((e) => (
            <EventRow key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  );
}
