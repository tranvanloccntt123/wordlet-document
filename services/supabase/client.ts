import { getSupabaseAnonKey, getSupabaseURL } from "@/constants/Supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthTokenResponse,
  createClient,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

export let supabase: SupabaseClient<any, "public", any> | null = null;

export const wordSupabase = createClient(
  "https://opsqmhzjheeewhlxektw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wc3FtaHpqaGVlZXdobHhla3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODk2NTIsImV4cCI6MjA2NDY2NTY1Mn0.CziF4JMt4995pi6894ephT07DLsfpz4_lHbK1YVte6s"
);

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

let userFetching: any = null;

let signInUser: any = null;

let cachedUser: User | null = null;

export const clearUserFetching = () => {
  userFetching = null;
  cachedUser = null;
};

export const getUsers = async (): Promise<User | null> => {
  if (cachedUser) {
    return cachedUser;
  }
  if (signInUser) {
    const waitingUser: AuthTokenResponse = await signInUser;
    if (waitingUser.data.user) {
      return waitingUser.data.user;
    }
  }
  if (!userFetching) {
    userFetching = fetchUser();
  }
  const response = await userFetching;
  cachedUser = response;
  clearUserFetching();
  return response;
};

export const fetchUser = async () => {
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  return user;
};

export const signInWithGoogle = async (token: string) => {
  signInUser = supabase!.auth.signInWithIdToken({
    token: token,
    provider: "google",
  });
  const response = await signInUser;
  if (response.data.user) {
    cachedUser = response.data.user;
  }
  signInUser = null;
};
