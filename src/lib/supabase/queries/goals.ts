import { createEntityQueries } from "@/lib/supabase/entity";
import type { Goal } from "@/types";

export const goalsQueries = createEntityQueries<Goal>("goals");
