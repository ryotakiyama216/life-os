import { createEntityQueries } from "@/lib/supabase/entity";
import type { LinkItem } from "@/types";

export const linksQueries = createEntityQueries<LinkItem>("links", { ascending: false });
