import { SUPABASE_SCHEMA, SUPABASE_TABLE } from "@/constants/Supabase";
import {
  PostgrestResponse,
  PostgrestSingleResponse,
} from "@supabase/supabase-js";
import { getUsers, supabase } from "./client";

let playerRankFetching: any = null;

export const clearPlayerRankFetching = () => {
  playerRankFetching = null;
};

export const fetchLeaderboardRanks = async (
  limit: number = 20,
  offset: number = 0
): Promise<PostgrestResponse<PlayerRank>> => {
  return supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.PLAYER_RANK)
    .select("id, user_id, total_score, rank, name, avatar")
    .order("rank", { ascending: true })
    .range(offset, offset + limit - 1) // Use range for pagination
    .limit(limit);
};

export const fetchUserPlayerRank = async () => {
  const user = await getUsers();
  const response = await supabase!
    .schema(SUPABASE_SCHEMA)
    .from("player_ranks")
    .select("id, user_id, total_score, rank, name, avatar")
    .eq("user_id", user?.id)
    .single();

  return response;
};

export const getUserPlayerRank = async (): Promise<
  PostgrestSingleResponse<PlayerRank>
> => {
  if (!playerRankFetching) {
    playerRankFetching = fetchUserPlayerRank();
  }
  const respone = await playerRankFetching;
  clearPlayerRankFetching();
  return respone;
};
