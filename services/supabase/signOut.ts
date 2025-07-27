import { SUPABASE_FUNCTION } from "@/constants/Supabase";
import {
  clearSocialUserFetching,
  clearUserFetching,
  getSocialUsers,
  getUsers,
  supabase,
  supabaseSocial,
} from "./client";
import { clearEnergyFetching } from "./energy";
import { clearOwnerGroupFetching } from "./group";
import { clearPlayerRankFetching } from "./leaderBoard";
import { clearFCMFetching, clearUserInfoFetching } from "./user";
import { clearVowelFetching } from "./vowel";

export const deleteAccount = async () => {
  try {
    const user = await getUsers();
    const response = await supabase!.functions.invoke(
      SUPABASE_FUNCTION.DELETE_USER,
      {
        body: { userId: user?.id },
      }
    );
    try {
      const socialUser = await getSocialUsers();
      await supabaseSocial!.functions.invoke(SUPABASE_FUNCTION.DELETE_USER, {
        body: { userId: socialUser?.id },
      });
    } catch {}
    return response;
  } catch (e) {
    throw e;
  }
};

export const signOut = () =>
  supabase!.auth.signOut().finally(() => {
    clearUserFetching();
    clearOwnerGroupFetching();
    clearVowelFetching();
    clearEnergyFetching();
    clearFCMFetching();
    clearPlayerRankFetching();
    clearUserInfoFetching();
    //SOCIAL
    clearSocialUserFetching();
  });
