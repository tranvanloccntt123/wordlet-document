import { SUPABASE_WORD_TABLE } from "@/constants/Supabase";
import { wordSupabase } from "./client";

export const fetchConversation = async (
  listCategories: string[],
  limit: number = 10,
  lastCreatedAt?: string
) => {
  try {
    let query = wordSupabase!
      .from(SUPABASE_WORD_TABLE.CONVERSATION)
      .select("*")
      .order("created_at", { ascending: false }) // Fetch newest first
      .limit(limit);
    if (listCategories.length) {
      const orConditions = listCategories
        .map((term) => `categories.ilike.%${term}%`)
        .join(",");
      query = query.or(orConditions);
    }
    if (lastCreatedAt) {
      query = query.lt("created_at", lastCreatedAt); // Fetch records older than the lastCreatedAt
    }
    return query;
  } catch (e) {
    throw e;
  }
};
