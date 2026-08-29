export function PageHeader({
  title,
  description,
  action,
  count,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-2">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {typeof count === "number" && (
            <span className="text-xs text-muted-foreground">表示中 {count}件</span>
          )}
        </div>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}
