"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/useAppStore";
import { isOverdue, formatDateJP } from "@/lib/date";

export function UpcomingEvents() {
  const allEvents = useAppStore((s) => s.events);
  const events = allEvents
    .filter((e) => !isOverdue(e.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5);

  if (events.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="size-4" />
          直近の予定
        </CardTitle>
        <Link href="/schedule" className="text-xs text-muted-foreground hover:text-foreground">
          すべて見る
        </Link>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-wrap gap-2">
          {events.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm"
            >
              <span className="text-xs tabular-nums text-muted-foreground">
                {formatDateJP(e.date)}
                {e.time && ` ${e.time}`}
              </span>
              <span>{e.title}</span>
              {e.location && <span className="text-xs text-muted-foreground">{e.location}</span>}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
