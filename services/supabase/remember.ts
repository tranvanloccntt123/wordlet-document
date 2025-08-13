import { SUPABASE_TABLE } from "@/constants/Supabase";
import { getUsers, wordSupabase } from "./client";

export const fetchWordLearning = async () => {
  try {
    const user = await getUsers();
    if (!user) {
      console.log("Throw user", user);
      throw "User not found";
    }
    let query = wordSupabase!
      .from(SUPABASE_TABLE.WORD_LEARNING)
      .select("*")
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false }); // Fetch newest first

    return query;
  } catch (e) {
    throw e;
  }
};
