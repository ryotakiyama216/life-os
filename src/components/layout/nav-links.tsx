"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CalendarDays,
  FileText,
  FolderKanban,
  History,
  Inbox,
  Link2,
  ListTodo,
  type LucideIcon,
  Repeat,
  Search,
  Settings,
  Target,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_GROUPS: { label?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: "/", label: "Today", icon: CalendarCheck },
      { href: "/inbox", label: "Inbox", icon: Inbox },
    ],
  },
  {
    label: "計画",
    items: [
      { href: "/goals", label: "目標", icon: Target },
      { href: "/projects", label: "プロジェクト", icon: FolderKanban },
      { href: "/tasks", label: "タスク", icon: ListTodo },
      { href: "/schedule", label: "予定", icon: CalendarDays },
      { href: "/habits", label: "習慣", icon: Repeat },
    ],
  },
  {
    label: "参照",
    items: [
      { href: "/search", label: "検索", icon: Search },
      { href: "/notes", label: "ページ・メモ", icon: FileText },
      { href: "/links", label: "リンク", icon: Link2 },
      { href: "/review", label: "振り返り", icon: History },
    ],
  },
];

const SETTINGS_ITEM: NavItem = { href: "/settings", label: "設定", icon: Settings };

export const NAV_ITEMS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM];

function NavLink({
  item,
  active,
  unprocessedCount,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  unprocessedCount: number;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
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
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const unprocessedCount = useAppStore((s) => s.inboxItems.filter((i) => !i.processed).length);

  function isActive(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  return (
    <nav className="flex flex-1 flex-col justify-between p-2">
      <div className="space-y-3">
        {NAV_GROUPS.map((group, i) => (
          <div key={i} className="space-y-1.5">
            {group.label && (
              <p className="px-3 pt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                {group.label}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(item.href)}
                unprocessedCount={unprocessedCount}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="space-y-1.5">
        <Separator />
        <NavLink
          item={SETTINGS_ITEM}
          active={isActive(SETTINGS_ITEM.href)}
          unprocessedCount={unprocessedCount}
          onNavigate={onNavigate}
        />
      </div>
    </nav>
  );
}
