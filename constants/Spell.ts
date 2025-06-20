import remoteConfig from "@react-native-firebase/remote-config";

export const getIPA = (): IPABoard =>
  remoteConfig().getString("IPA")
    ? JSON.parse(
        remoteConfig().getString("IPA") || "{vowels: [], consonants: []}"
      )
    : { vowels: [], consonants: [] };
