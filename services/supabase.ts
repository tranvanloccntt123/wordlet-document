import {
  getSupabaseAnonKey,
  getSupabaseURL,
  SUPABASE_FUNCTION,
  SUPABASE_SCHEMA,
  SUPABASE_TABLE,
} from "@/constants/Supabase";
import i18next from "@/i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createClient,
  PostgrestResponse,
  PostgrestSingleResponse,
  SupabaseClient,
} from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

let supabase: SupabaseClient<any, "public", any> | null = null;

export const init = () => {
  supabase = createClient(getSupabaseURL(), getSupabaseAnonKey(), {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
};

export const signInWithGoogle = (token: string) => {
  supabase!.auth.signInWithIdToken({ token: token, provider: "google" });
};

export const signOut = () => supabase!.auth.signOut();

export const getEnergy = async () => {
  try {
    const {
      data: { user },
    } = await supabase!.auth.getUser();

    const response: PostgrestSingleResponse<Energy> = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.ENERGY)
      .select()
      .eq("user_id", user?.id)
      .single();
    return response;
  } catch (e) {
    throw e;
  }
};

export const decreaseEnergy = async ({
  historyId,
  score,
  message,
}: {
  historyId?: number | null;
  score: number;
  message: string;
}) => {
  await supabase!.functions.invoke(SUPABASE_FUNCTION.DECREASE_ENERGY, {
    body: { historyId, score, message },
  });
};

export const createGroup = async (name?: string) => {
  try {
    const {
      data: { user },
    } = await supabase!.auth.getUser();

    const response = await supabase!.functions.invoke(
      SUPABASE_FUNCTION.CREATE_GROUP,
      {
        body: { user_id: user?.id, words: [], name },
      }
    );
    return response;
  } catch (e) {
    throw e;
  }
};

export const deleteGroup = async (groupId: number) => {
  try {
    const response = await supabase!.functions.invoke(
      SUPABASE_FUNCTION.DELETE_GROUP,
      {
        body: { userId: groupId },
      }
    );
    return response;
  } catch (e) {
    throw e;
  }
};

export const deleteAccount = async () => {
  try {
    const {
      data: { user },
    } = await supabase!.auth.getUser();
    const response = await supabase!.functions.invoke(
      SUPABASE_FUNCTION.DELETE_USER,
      {
        body: { userId: user?.id },
      }
    );
    return response;
  } catch (e) {
    throw e;
  }
};

export const fetchVowelPercent = async () => {
  try {
    const {
      data: { user },
    } = await supabase!.auth.getUser();
    const response: PostgrestSingleResponse<VowelPercent[]> = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.VOWEL_PERCENT)
      .select("*")
      .eq("user_id", user?.id);
    return response;
  } catch (e) {
    throw e;
  }
};

export const insertVowelPercent = async (char: string, percent: number) => {
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  return await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.VOWEL_PERCENT)
    .insert({ percent, char, user_id: user?.id })
    .select()
    .single();
};

export const updateVowelPercent = async (char: string, percent: number) => {
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  return await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.VOWEL_PERCENT)
    .update({ percent })
    .eq("id", user?.id)
    .eq("char", char)
    .select()
    .single();
};

export const createNewGame = async (groupId?: number) => {
  try {
    const response = await supabase!.functions.invoke(
      SUPABASE_FUNCTION.NEW_GAME,
      {
        body: { groupId },
      }
    );
    return response;
  } catch (e) {
    throw e;
  }
};

export const fetchOwnerGroup = async () => {
  try {
    const {
      data: { user },
    } = await supabase!.auth.getUser();
    const response: PostgrestSingleResponse<Group[]> = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .select("*")
      .eq("user_id", user?.id)
      .eq("is_deleted", false);

    return response;
  } catch (e) {
    throw e;
  }
};

export const fetchGroupDetail = async (groupId: number) => {
  try {
    const response: PostgrestSingleResponse<Group> = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .select("*")
      .eq("id", groupId)
      .single();

    return response;
  } catch (e) {
    throw e;
  }
};

export const updateGroup = async (group: Group) => {
  try {
    const { data, error } = await supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .update({ name: group.name, words: group.words, user_id: group.user_id })
      .eq("id", group.id)
      .select()
      .single();
    if (error) {
      console.log(error);
      throw i18next.t("groups.errorUpdatingGroup");
    }
    return data;
  } catch (e) {
    throw e;
  }
};

export const wordSupabase = createClient(
  "https://opsqmhzjheeewhlxektw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wc3FtaHpqaGVlZXdobHhla3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODk2NTIsImV4cCI6MjA2NDY2NTY1Mn0.CziF4JMt4995pi6894ephT07DLsfpz4_lHbK1YVte6s"
);

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

export const fetchUserPlayerRank = async (): Promise<
  PostgrestSingleResponse<PlayerRank>
> => {
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  return supabase!
    .schema(SUPABASE_SCHEMA)
    .from("player_ranks")
    .select("id, user_id, total_score, rank, name, avatar")
    .eq("user_id", user?.id)
    .single();
};

export const fetchUserGameHistory = async (
  limit: number = 10,
  lastCreatedAt?: string // Pass the 'created_at' of the last fetched item
): Promise<PostgrestResponse<GameHistory>> => {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  const {
    data: { user },
  } = await supabase!.auth.getUser();

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

  return query as any;
};

export const fetchUser = async () => {
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  return user;
};

export const fetchGroups = async (
  limit: number = 10,
  lastCreatedAt?: string // Pass the 'created_at' of the last fetched item
) => {
  try {
    let query = supabase!
      .schema(SUPABASE_SCHEMA)
      .from(SUPABASE_TABLE.GROUP)
      .select("id, name, created_at, words, is_boosted, user_id")
      .order("is_boosted", { ascending: false })
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

export const fetchUpdateFCMToken = async (token: string) => {
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  await supabase!
    .schema(SUPABASE_SCHEMA)
    .from(SUPABASE_TABLE.PROFILE)
    .update({ fcm_token: token })
    .eq("id", user?.id)
    .select()
    .single();
};
