"use client";

import { Link2, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { LinkFormDialog } from "@/components/link/link-form-dialog";
import { LinkRow } from "@/components/link/link-row";
import { useAppStore } from "@/store/useAppStore";

const UNCATEGORIZED = "未分類";

export default function LinksPage() {
  const links = useAppStore((s) => s.links);

  const groups = new Map<string, typeof links>();
  for (const link of links) {
    const key = link.category || UNCATEGORIZED;
    const group = groups.get(key);
    if (group) group.push(link);
    else groups.set(key, [link]);
  }

  return (
    <div>
      <PageHeader
        title="リンク"
        description="メール・Meetなど、仕事でよく開くURLをまとめて管理する"
        action={
          <LinkFormDialog
            trigger={
              <Button size="sm" className="gap-1.5">
                <Plus className="size-4" />
                リンクを追加
              </Button>
            }
          />
        }
      />
      {links.length === 0 ? (
        <EmptyState
          icon={Link2}
          title="リンクがまだありません"
          description="よく開くメール・会議URLなどを登録しておくと、ここからすぐ開けます"
        />
      ) : (
        <div className="space-y-6">
          {Array.from(groups.entries()).map(([category, items]) => (
            <section key={category} className="space-y-2.5">
              <h2 className="text-sm font-semibold text-muted-foreground">{category}</h2>
              <div className="space-y-2.5">
                {items.map((l) => (
                  <LinkRow key={l.id} link={l} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
