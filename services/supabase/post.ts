import { SUPABASE_SOCIAL_TABLE } from "@/constants/Supabase";
import { getSocialUsers, supabaseSocial } from "./client";

export const createPost = async (
  content: string,
  params: Record<string, any>
) => {
  try {
    const user = await getSocialUsers();
    const response = await supabaseSocial
      ?.from(SUPABASE_SOCIAL_TABLE.POST)
      .insert({
        content,
        params,
        user_id: user?.id,
      })
      .select();
    return response;
  } catch (e) {}
};

export const fetchPosts = async (
  limit: number = 10,
  lastCreatedAt?: string // Pass the 'created_at' of the last fetched item
) => {
  try {
    let query = supabaseSocial!
      .from(SUPABASE_SOCIAL_TABLE.POST)
      .select("*, user_info(*)")
      .order("created_at", { ascending: false }) // Fetch newest first
      .limit(limit);
    if (lastCreatedAt) {
      query = query.lt("created_at", lastCreatedAt); // Fetch records older than the lastCreatedAt
    }
    return query;
  } catch (e) {
    throw e;
  }
};
