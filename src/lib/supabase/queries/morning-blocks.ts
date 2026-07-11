import { createEntityQueries } from "@/lib/supabase/entity";
import type { MorningBlock } from "@/types";

export const morningBlocksQueries = createEntityQueries<MorningBlock>("morning_blocks", {
  orderBy: "time",
});
