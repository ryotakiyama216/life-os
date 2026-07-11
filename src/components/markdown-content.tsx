import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function MarkdownContent({ content, className }: { content: string; className?: string }) {
  if (!content.trim()) {
    return <p className="text-sm text-muted-foreground">（内容はまだありません）</p>;
  }
  return (
    <div
      className={cn(
        "prose prose-neutral prose-sm max-w-none dark:prose-invert",
        "prose-headings:font-semibold prose-a:text-foreground",
        className
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
