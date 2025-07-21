import { RewardedAd, TestIds } from "react-native-google-mobile-ads";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AdMobState {
  status: boolean;
  reward: RewardedAd | null;
  suggestReward: RewardedAd | null;
  suggestRewardedLoaded: boolean;
  suggestRewardSuccess: boolean;
  setSuggestRewardSuccess: (_: boolean) => void;
  setSuggestRewardedLoaded: (_: boolean) => void;
  setStatus: (_: boolean) => void;
  setReward: (user_id: string) => void;
  setSuggestReward: (user_id: string) => void;
}

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-3212595540202226/9038566356";

const suggestionUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-3212595540202226/1199782391";

export const admobStore = create<AdMobState, any>( // Added 'any' for middleware compatibility like in other stores
  immer((set) => ({
    status: false,
    reward: null,
    suggestReward: null,
    suggestRewardedLoaded: false,
    suggestRewardSuccess: false,
    setSuggestRewardSuccess: (success) => {
      set((state) => {
        state.suggestRewardSuccess = success;
      });
    },
    setStatus(status) {
      set((state) => {
        state.status = status;
      });
    },
    setReward(userId) {
      set((state) => {
        state.reward = RewardedAd.createForAdRequest(adUnitId, {
          serverSideVerificationOptions: {
            userId: userId,
          },
        });
      });
    },
    setSuggestReward(userId) {
      set((state) => {
        state.suggestReward = RewardedAd.createForAdRequest(suggestionUnitId, {
          serverSideVerificationOptions: {
            userId: userId,
          },
        });
      });
    },
    setSuggestRewardedLoaded(loaded: boolean) {
      set((state) => {
        state.suggestRewardedLoaded = loaded;
      });
    },
  }))
);

const useAdMobStore = admobStore;

export default useAdMobStore;
