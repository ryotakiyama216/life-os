import {
  differenceInCalendarDays,
  format,
  isToday as fnsIsToday,
  parseISO,
} from "date-fns";
import { ja } from "date-fns/locale";

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function isToday(dateStr?: string): boolean {
  if (!dateStr) return false;
  return fnsIsToday(parseISO(dateStr));
}

/** 今日より前なら true（＝期限切れ） */
export function isOverdue(dateStr?: string): boolean {
  if (!dateStr) return false;
  return daysFromToday(dateStr) < 0;
}

/** 今日を0として、対象日までの日数（過去はマイナス） */
export function daysFromToday(dateStr: string): number {
  return differenceInCalendarDays(parseISO(dateStr), new Date());
}

export function formatDateJP(dateStr?: string): string {
  if (!dateStr) return "";
  return format(parseISO(dateStr), "M月d日");
}

export function formatDateFullJP(dateStr?: string): string {
  if (!dateStr) return "";
  return format(parseISO(dateStr), "yyyy年M月d日（E）", { locale: ja });
}

export function formatDateTimeJP(dateStr?: string): string {
  if (!dateStr) return "";
  return format(parseISO(dateStr), "M月d日 HH:mm");
}

export function overdueLabel(dateStr: string): string {
  const days = Math.abs(daysFromToday(dateStr));
  if (days === 0) return "今日が期限";
  return `${days}日超過`;
}

export function weekdayOf(dateStr: string): number {
  return parseISO(dateStr).getDay();
}
