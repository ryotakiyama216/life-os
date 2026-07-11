import { createEntityQueries } from "@/lib/supabase/entity";
import type { Note } from "@/types";

export const notesQueries = createEntityQueries<Note>("notes", { ascending: false });
