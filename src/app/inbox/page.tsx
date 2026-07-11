"use client";

import { Inbox } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { InboxItemRow } from "@/components/inbox/inbox-item-row";
import { QuickCaptureDialog } from "@/components/quick-capture-dialog";
import { useAppStore } from "@/store/useAppStore";

export default function InboxPage() {
  const items = useAppStore((s) => s.inboxItems);

  return (
    <div>
      <PageHeader
        title="Inbox"
        description="思いついたことをまず全部ここに。仕分けてから次の場所へ動かしましょう"
        action={<QuickCaptureDialog />}
      />
      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Inboxは空です"
          description="右上のクイックキャプチャから、気になることを書き溜めましょう"
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <InboxItemRow key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
