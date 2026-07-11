"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  FileText,
  FolderKanban,
  History,
  Inbox,
  ListTodo,
  Repeat,
  Search,
  Settings,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

export const NAV_ITEMS = [
  { href: "/", label: "Today", icon: CalendarCheck },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/goals", label: "目標", icon: Target },
  { href: "/projects", label: "プロジェクト", icon: FolderKanban },
  { href: "/tasks", label: "タスク", icon: ListTodo },
  { href: "/search", label: "検索", icon: Search },
  { href: "/habits", label: "習慣", icon: Repeat },
  { href: "/notes", label: "ページ・メモ", icon: FileText },
  { href: "/review", label: "振り返り", icon: History },
  { href: "/settings", label: "設定", icon: Settings },
] as const;

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const unprocessedCount = useAppStore((s) => s.inboxItems.filter((i) => !i.processed).length);

  return (
    <nav className="flex-1 space-y-0.5 p-2">
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-secondary text-secondary-foreground font-medium"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="size-4" />
              {item.label}
            </span>
            {item.href === "/inbox" && unprocessedCount > 0 && (
              <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] leading-none text-background">
                {unprocessedCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
