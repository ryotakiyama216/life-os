import { cn } from "@/lib/utils";
import { formatDateJP, overdueLabel } from "@/lib/date";

export function OverdueLabel({
  date,
  label,
  suffix,
  className,
}: {
  date: string;
  label?: string;
  suffix?: string;
  className?: string;
}) {
  return (
    <span className={cn("text-xs font-medium text-red-600 dark:text-red-400", className)}>
      {label}
      {formatDateJP(date)}（{overdueLabel(date)}
      {suffix && `・${suffix}`}）
    </span>
  );
}
