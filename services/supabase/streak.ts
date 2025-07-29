import { SUPABASE_SCHEMA, SUPABASE_TABLE } from "@/constants/Supabase";
import { getUsers, supabase } from "./client";

export const fetchOwnerStreak = async () => {
  const user = await getUsers();
  if (!user) {
    throw "User not found";
  }
  const response = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.USER_STREAKS)
    .select("*")
    .eq("user_id", user?.id);
  return response;
};

export const fetchStreakDays = async () => {
  const user = await getUsers();
  if (!user) {
    throw "User not found";
  }
  const response = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.STREAK_DAYS)
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false }) // Fetch newest first
    .limit(10);
  return response;
};
