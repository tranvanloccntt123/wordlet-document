import { SUPABASE_SCHEMA, SUPABASE_TABLE } from "@/constants/Supabase";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { getUsers, supabase } from "./client";

let fcmFetching: any = null;

let userFetching: any = null;

export const clearFCMFetching = () => {
  fcmFetching = null;
};

export const clearUserInfoFetching = () => {
  userFetching = null;
};

export const fetchUserGameHistory = async (
  limit: number = 10,
  lastCreatedAt?: string // Pass the 'created_at' of the last fetched item
): Promise<PostgrestSingleResponse<GameHistory[]>> => {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  const user = await getUsers();

  if (!user) {
    throw "User not found";
  }

  let query = supabase
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.HISTORY) // Make sure SUPABASE_TABLE.HISTORY is defined in your constants
    .select("id, score, created_at, message, group(id, name, words)") // Ensure 'created_at' matches your Supabase column name
    .eq("user_id", user?.id)
    .eq("status", "FINISHED")
    .order("created_at", { ascending: false }) // Fetch newest first
    .limit(limit);

  if (lastCreatedAt) {
    query = query.lt("created_at", lastCreatedAt); // Fetch records older than the lastCreatedAt
  }

  const response = await query;

  return response as PostgrestSingleResponse<GameHistory[]>;
};

const fetchUpdateFCMToken = async (token: string) => {
  const user = await getUsers();
  if (!user) {
    throw "User not found";
  }
  await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.PROFILE)
    .update({ fcm_token: token })
    .eq("id", user?.id)
    .select()
    .single();
};

export const updateFCMToken = async (token: string) => {
  if (!fcmFetching) {
    fcmFetching = fetchUpdateFCMToken(token);
  }
  await fcmFetching;
  clearFCMFetching();
};

export const fetchUserInfo = async () => {
  const user = await getUsers();
  if (!user) {
    throw "User not found";
  }
  const response = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.INFO)
    .select("*")
    .eq("user_id", user?.id)
    .single();
  return response;
};

export const getUserInfo = async () => {
  if (!userFetching) {
    userFetching = fetchUserInfo();
  }
  const response = await userFetching;
  clearUserInfoFetching();
  return response;
};
