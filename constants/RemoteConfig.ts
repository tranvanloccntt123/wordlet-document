import remoteConfig from "@react-native-firebase/remote-config";

export const getIPA = (): IPABoard =>
  remoteConfig().getString("IPA")
    ? JSON.parse(
        remoteConfig().getString("IPA") || "{ vowels: [], consonants: [] }"
      )
    : { vowels: [], consonants: [] };

export const getSericesConfig = (): {
  MAX_SERICES: number;
  MAX_GROUPS: number;
} =>
  remoteConfig().getString("SERICES")
    ? JSON.parse(
        remoteConfig().getString("SERICES") ||
          "{ MAX_SERICES: 4, MAX_GROUPS: 4 }"
      )
    : { MAX_SERICES: 4, MAX_GROUPS: 4 };
