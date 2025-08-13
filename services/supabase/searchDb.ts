import { SEARCH_LIMIT } from "@/constants";
import { SUPABASE_WORD_TABLE } from "@/constants/Supabase";
import { wordSupabase } from "."; // Import wordSupabase

export const fetchSearchResults = async (
  keyword: string,
  page: number,
  source: string | null, // null for all sources, or specific source name
  signal?: AbortController | null
): Promise<WordStore[]> => {
  if (!keyword.trim()) {
    return [];
  }
  try {
    const offset = page * SEARCH_LIMIT;

    let allQuery = wordSupabase
      .from(SUPABASE_WORD_TABLE.WORD)
      .select("*")
      .like("word", `%${keyword.toLowerCase()}%`)
      .neq("word", keyword.toLowerCase())
      .range(offset, offset + SEARCH_LIMIT);

    if (source) {
      allQuery = allQuery.eq("source", source);
    }
    if (signal) {
      allQuery = allQuery.abortSignal(signal.signal);
    }
    const { data: allData } = await allQuery;

    if (offset === 0) {
      let absoluteQuery = wordSupabase
        .from(SUPABASE_WORD_TABLE.WORD)
        .select("*")
        .eq("word", keyword.toLowerCase());
      let absoluteWord = await absoluteQuery.single();
      if (!absoluteWord.error) {
        return [absoluteWord.data as WordStore, ...(allData as WordStore[])];
      }
    }

    return allData as WordStore[];
  } catch {
    return [];
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
