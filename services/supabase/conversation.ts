import {
  SUPABASE_SCHEMA,
  SUPABASE_TABLE,
  SUPABASE_WORD_TABLE,
} from "@/constants/Supabase";
import { getUsers, supabase, wordSupabase } from "./client";

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
        .map((term) => `categories.like.%${term}%`)
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

export const fetchUnlockedConversation = async (list: number[]) => {
  try {
    const user = await getUsers();
    if (!user) {
      console.log("Throw user", user);
      throw "User not found";
    }
    let query = supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.UNLOCKED_CONVERSATION)
      .select("*")
      .eq("user_id", user.id)
      .in("conversation_id", list);
    return query;
  } catch (e) {
    throw e;
  }
};

export const unlockConversation = async (id: number) => {
  try {
    const user = await getUsers();
    if (!user) {
      console.log("Throw user", user);
      throw "User not found";
    }
    return supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.UNLOCKED_CONVERSATION)
      .insert({ conversation_id: id, user_id: user.id })
      .select();
  } catch (e) {
    throw e;
  }
};
