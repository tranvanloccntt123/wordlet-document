import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  AuthTokenResponse,
  createClient,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

export let supabase: SupabaseClient<any, "public", any> | null = createClient(
  "https://stbegjkbkkthmkveforb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0YmVnamtia2t0aG1rdmVmb3JiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3ODM1ODYsImV4cCI6MjA2NDM1OTU4Nn0.k4PK8Jw_Jpvbb8izwhppzKo1sjrtVDRhnaWK0Jux2NY",
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export let supabaseSocial: SupabaseClient<any, "public", any> | null =
  createClient(
    "https://nwtgzbltargxlppvnvkt.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dGd6Ymx0YXJneGxwcHZudmt0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NjEwMjYsImV4cCI6MjA2ODEzNzAyNn0.J4dHyImwfeUIcSVbWZMFuYw5rZXp0KqoVE-e5xUk62I",
    {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );

export const wordSupabase = createClient(
  "https://opsqmhzjheeewhlxektw.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wc3FtaHpqaGVlZXdobHhla3R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwODk2NTIsImV4cCI6MjA2NDY2NTY1Mn0.CziF4JMt4995pi6894ephT07DLsfpz4_lHbK1YVte6s"
);

export const init = () => {
  // supabase = createClient(getSupabaseURL(), getSupabaseAnonKey(), {
  //   auth: {
  //     storage: AsyncStorage,
  //     autoRefreshToken: true,
  //     persistSession: true,
  //     detectSessionInUrl: false,
  //   },
  // });
};

let userFetching: any = null;

let signInUser: any = null;

let cachedUser: User | null = null;

let socialUserFetching: any = null;

let cachedSocialUser: User | null = null;

export const clearUserFetching = () => {
  userFetching = null;
  cachedUser = null;
};

export const clearSocialUserFetching = () => {
  socialUserFetching = null;
  cachedSocialUser = null;
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
  return response;
};

export const getSocialUsers = async (): Promise<User | null> => {
  if (cachedSocialUser) {
    return cachedSocialUser;
  }
  if (!socialUserFetching) {
    socialUserFetching = fetchSocialUser();
  }
  const response = await socialUserFetching;
  cachedSocialUser = response;
  clearSocialUserFetching();
  return response;
};

export const fetchUser = async () => {
  const {
    data: { user },
  } = await supabase!.auth.getUser();
  return user;
};

export const fetchSocialUser = async () => {
  const {
    data: { user },
  } = await supabaseSocial!.auth.getUser();
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
  await supabaseSocial!.auth.signInWithIdToken({
    token: token,
    provider: "google",
  });
  signInUser = null;
};
