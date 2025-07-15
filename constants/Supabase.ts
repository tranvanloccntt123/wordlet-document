import remoteConfig from "@react-native-firebase/remote-config";

export const getSupabaseURL = (): string =>
  remoteConfig().getString("EXPO_PUBLIC_SUPABASE_URL") || "";

export const getSupabaseAnonKey = (): string =>
  remoteConfig().getString("EXPO_PUBLIC_SUPABASE_ANON_KEY") || "";

export const SUPABASE_SCHEMA = "public";

export const SUPABASE_TABLE = {
  ENERGY: "energy",
  INFO: "info",
  GROUP: "group",
  HISTORY: "history",
  PLAYER_RANK: "player_ranks",
  PROFILE: "profiles",
  VOWEL_PERCENT: "vowel_percent",
  SERIES: "series",
  REPORT: "report",
};

export const SUPABASE_FUNCTION = {
  CREATE_GROUP: "create_groups",
  DELETE_GROUP: "delete_group",
  NEW_GAME: "new-game",
  DECREASE_ENERGY: "decrease_energy",
  DECREASE_ENERGYV2: "decrease_energy_v2",
  DECREASE_SUGGEST: "decrease_suggest",
  DELETE_USER: "delete-user",
};
