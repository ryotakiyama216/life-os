"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/markdown-content";

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minRows = 10,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
}) {
  return (
    <Tabs defaultValue="edit">
      <TabsList>
        <TabsTrigger value="edit">編集</TabsTrigger>
        <TabsTrigger value="preview">プレビュー</TabsTrigger>
      </TabsList>
      <TabsContent value="edit">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Markdownで書けます（見出し、リスト、チェックボックスなど）"}
          rows={minRows}
          className="resize-y font-mono text-sm"
          style={{ minHeight: `${minRows * 1.5}rem` }}
        />
      </TabsContent>
      <TabsContent
        value="preview"
        className="rounded-md border px-4 py-3"
        style={{ minHeight: `${minRows * 1.5}rem` }}
      >
        <MarkdownContent content={value} />
      </TabsContent>
    </Tabs>
  );
}
