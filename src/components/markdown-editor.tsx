"use client";

import { useRef } from "react";
import {
  Bold,
  CheckSquare,
  Code,
  Heading2,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/markdown-content";
import { Button } from "@/components/ui/button";

type ChangeFn = (value: string) => void;

function focusAndSelect(el: HTMLTextAreaElement, start: number, end: number) {
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(start, end);
  });
}

function wrapSelection(el: HTMLTextAreaElement, value: string, onChange: ChangeFn, before: string, after: string = before) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = value.slice(start, end);
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  onChange(next);
  focusAndSelect(el, start + before.length, start + before.length + selected.length);
}

/** 選択範囲を含む行それぞれの先頭にprefixを挿入する（見出し・リスト・引用など） */
function prefixLines(
  el: HTMLTextAreaElement,
  value: string,
  onChange: ChangeFn,
  makePrefix: (lineIndex: number) => string
) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextNewline = value.indexOf("\n", end);
  const lineEnd = nextNewline === -1 ? value.length : nextNewline;
  const block = value.slice(lineStart, lineEnd);
  const lines = block.length > 0 ? block.split("\n") : [""];
  const newBlock = lines.map((line, i) => makePrefix(i) + line).join("\n");
  const next = value.slice(0, lineStart) + newBlock + value.slice(lineEnd);
  onChange(next);
  focusAndSelect(el, lineStart, lineStart + newBlock.length);
}

function insertLink(el: HTMLTextAreaElement, value: string, onChange: ChangeFn) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = value.slice(start, end) || "リンクテキスト";
  const url = "https://";
  const insertText = `[${selected}](${url})`;
  const next = value.slice(0, start) + insertText + value.slice(end);
  onChange(next);
  const urlStart = start + selected.length + 3; // "[" + selected + "]("
  focusAndSelect(el, urlStart, urlStart + url.length);
}

function insertCode(el: HTMLTextAreaElement, value: string, onChange: ChangeFn) {
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const selected = value.slice(start, end);
  if (!selected.includes("\n")) {
    wrapSelection(el, value, onChange, "`");
    return;
  }
  const before = "```\n";
  const after = "\n```";
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  onChange(next);
  focusAndSelect(el, start + before.length, start + before.length + selected.length);
}

const TOOLBAR_ITEMS: {
  icon: typeof Bold;
  label: string;
  run: (el: HTMLTextAreaElement, value: string, onChange: ChangeFn) => void;
}[] = [
  { icon: Heading2, label: "見出し", run: (el, v, c) => prefixLines(el, v, c, () => "## ") },
  { icon: Bold, label: "太字", run: (el, v, c) => wrapSelection(el, v, c, "**") },
  { icon: Italic, label: "斜体", run: (el, v, c) => wrapSelection(el, v, c, "*") },
  { icon: Strikethrough, label: "取り消し線", run: (el, v, c) => wrapSelection(el, v, c, "~~") },
  { icon: List, label: "箇条書き", run: (el, v, c) => prefixLines(el, v, c, () => "- ") },
  {
    icon: ListOrdered,
    label: "番号付きリスト",
    run: (el, v, c) => prefixLines(el, v, c, (i) => `${i + 1}. `),
  },
  {
    icon: CheckSquare,
    label: "チェックボックス",
    run: (el, v, c) => prefixLines(el, v, c, () => "- [ ] "),
  },
  { icon: Quote, label: "引用", run: (el, v, c) => prefixLines(el, v, c, () => "> ") },
  { icon: Link2, label: "リンク", run: (el, v, c) => insertLink(el, v, c) },
  { icon: Code, label: "コード", run: (el, v, c) => insertCode(el, v, c) },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  minRows = 10,
}: {
  value: string;
  onChange: ChangeFn;
  placeholder?: string;
  minRows?: number;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <Tabs defaultValue="edit">
      <TabsList>
        <TabsTrigger value="edit">編集</TabsTrigger>
        <TabsTrigger value="preview">プレビュー</TabsTrigger>
      </TabsList>
      <TabsContent value="edit" className="space-y-1.5">
        <div className="flex flex-wrap gap-0.5 rounded-md border bg-muted/40 p-1">
          {TOOLBAR_ITEMS.map(({ icon: Icon, label, run }) => (
            <Button
              key={label}
              type="button"
              variant="ghost"
              size="icon"
              title={label}
              aria-label={label}
              onClick={() => {
                const el = textareaRef.current;
                if (!el) return;
                run(el, value, onChange);
              }}
            >
              <Icon className="size-4" />
            </Button>
          ))}
        </div>
        <Textarea
          ref={textareaRef}
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
