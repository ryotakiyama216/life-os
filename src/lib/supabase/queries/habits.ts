import { createClient } from "@/lib/supabase/client";
import { createEntityQueries } from "@/lib/supabase/entity";
import { fromDbRow } from "@/lib/supabase/case";
import type { Habit, HabitLog } from "@/types";

export const habitsQueries = createEntityQueries<Habit>("habits");

export async function fetchHabitLogs(): Promise<HabitLog[]> {
  const { data, error } = await createClient().from("habit_logs").select("*");
  if (error) throw error;
  return (data ?? []).map((row) => fromDbRow<HabitLog>(row));
}

/** 指定日のログが無ければ完了として作成、あれば完了状態を反転する */
export async function toggleHabitLogRow(habitId: string, date: string): Promise<HabitLog> {
  const client = createClient();
  const { data: existing, error: fetchError } = await client
    .from("habit_logs")
    .select("*")
    .eq("habit_id", habitId)
    .eq("date", date)
    .maybeSingle();
  if (fetchError) throw fetchError;

  if (existing) {
    const { data, error } = await client
      .from("habit_logs")
      .update({ completed: !existing.completed })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    return fromDbRow<HabitLog>(data);
  }

  const { data, error } = await client
    .from("habit_logs")
    .insert({ habit_id: habitId, date, completed: true })
    .select()
    .single();
  if (error) throw error;
  return fromDbRow<HabitLog>(data);
}
