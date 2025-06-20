import { SEARCH_LIMIT } from "@/constants";
import { wordSupabase } from "./supabase"; // Import wordSupabase

export const fetchSearchResults = async (
  keyword: string,
  page: number,
  source: string | null // null for all sources, or specific source name
): Promise<WordStore[]> => {
  if (!keyword.trim()) {
    return [];
  }
  try {
    const offset = page * SEARCH_LIMIT;

    // Ensure the SQL function 'search_fts_words_advanced' (as defined in the accompanying notes)
    // exists in your Supabase database.
    // This function handles the keyword matching (ILIKE), source filtering,
    // custom ordering (exact matches first), and pagination.
    const { data, error } = await wordSupabase.rpc(
      "search_fts_words_advanced",
      {
        p_keyword: keyword, // The RPC function will handle lowercasing and wildcard for ILIKE
        p_source: source, // Pass null if no source filter is needed
        p_limit: SEARCH_LIMIT,
        p_offset: offset,
      }
    );

    if (error) {
      console.error("Error searching words with Supabase RPC:", error);
      return [];
    }

    return data || []; // Ensure an array is always returned
  } catch (error) {
    console.error("Error searching words:", error);
    return []; // Return empty on error to allow fallback or indicate failure
  }
};

export const fetchWordsByKeywordList = async (
  keywords: string[],
  source?: string | null // null for all sources, or specific source name
): Promise<WordStore[]> => {
  const validKeywords = keywords
    .map((k) => k.toLowerCase().trim())
    .filter((k) => k.length > 0);

  if (validKeywords.length === 0) {
    return [];
  }

  try {
    // Call the RPC function created in your Supabase database
    const { data, error } = await wordSupabase.rpc(
      "fetch_words_by_keyword_list_advanced",
      {
        p_keywords: validKeywords.map((v) => v.trim().toLowerCase()),
        p_source: source, // Pass null if no source filter is needed
      }
    );

    if (error) {
      console.error(
        "Error searching words by keyword list with Supabase RPC:",
        error
      );
      return [];
    }

    return data || []; // Ensure an array is always returned
  } catch (error) {
    console.error("Error searching words by keyword list:", error);
    return [];
  }
};
