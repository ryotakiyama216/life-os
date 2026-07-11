import { createClient } from "@/lib/supabase/client";
import { fromDbRow, toDbRow } from "@/lib/supabase/case";

/** goals/projects/tasks/habits/inbox_items/notes/morning_blocksのような「id持ちの単純CRUDテーブル」向けの共通クエリ生成器 */
export function createEntityQueries<T extends { id: string }>(
  table: string,
  options: { orderBy?: string; ascending?: boolean } = {}
) {
  const { orderBy = "created_at", ascending = true } = options;

  return {
    async fetchAll(): Promise<T[]> {
      const { data, error } = await createClient()
        .from(table)
        .select("*")
        .order(orderBy, { ascending });
      if (error) throw error;
      return (data ?? []).map((row) => fromDbRow<T>(row));
    },

    async insert(input: Record<string, unknown>): Promise<T> {
      const { data, error } = await createClient()
        .from(table)
        .insert(toDbRow(input))
        .select()
        .single();
      if (error) throw error;
      return fromDbRow<T>(data);
    },

    async update(id: string, patch: Record<string, unknown>): Promise<T> {
      const { data, error } = await createClient()
        .from(table)
        .update(toDbRow(patch))
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return fromDbRow<T>(data);
    },

    async remove(id: string): Promise<void> {
      const { error } = await createClient().from(table).delete().eq("id", id);
      if (error) throw error;
    },
  };
}
