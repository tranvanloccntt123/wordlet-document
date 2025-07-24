import * as Mixpanel from "@/services/mixpanel";
import useAdMobStore from "@/store/admobStore";
import useEnergyStore from "@/store/energyStore";
import useInfoStore from "@/store/infoStore";
import {
  getAdvertisingId,
  requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import React from "react";
import mobileAds, {
  MaxAdContentRating,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";

const RewardManager: React.FC = () => {
  const status = useAdMobStore((state) => state.status);
  const rewarded = useAdMobStore((state) => state.reward);
  const suggestRewarded = useAdMobStore((state) => state.suggestReward);
  const userInfo = useInfoStore((state) => state.info);
  const setSuggestRewardedSuccess = useAdMobStore(
    (state) => state.setSuggestRewardSuccess
  );
  const setRewarded = useAdMobStore((state) => state.setReward);
  const setStatus = useAdMobStore((state) => state.setStatus);
  const setSuggestRewarded = useAdMobStore((state) => state.setSuggestReward);
  const setSuggestRewardedLoaded = useAdMobStore(
    (state) => state.setSuggestRewardedLoaded
  );
  const setRewardedLoaded = useAdMobStore((state) => state.setRewardLoaded);
  const fetchEnergy = useEnergyStore((state) => state.fetchEnergy);
  const increaseEnergyAfterReward = useEnergyStore(
    (state) => state.increaseEnergyAfterReward
  );

  React.useEffect(() => {
    if (!status || !userInfo) return;
    if (!rewarded) {
      setRewarded(userInfo.user_id);
    } else {
      const unsubscribeLoaded = rewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          setRewardedLoaded(true);
        }
      );
      const unsubscribeEarned = rewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          //increase energy in local
          increaseEnergyAfterReward();
          //Refresh energy
          setTimeout(() => {
            //Confirm server increases the energy
            fetchEnergy(true);
          }, 200);
          //
          setRewardedLoaded(false);
          setRewarded(userInfo.user_id);
          Mixpanel.showAds({ category: "INCREASE_ENERGY", ...reward });
        }
      );

      // Start loading the rewarded ad straight away
      rewarded.load();

      // Unsubscribe from events on unmount
      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
      };
    }
  }, [status, rewarded, userInfo]);

  React.useEffect(() => {
    if (!status || !userInfo) return;
    if (!suggestRewarded) {
      setSuggestRewarded(userInfo.user_id);
    } else {
      const unsubscribeLoaded = suggestRewarded.addAdEventListener(
        RewardedAdEventType.LOADED,
        () => {
          setSuggestRewardedLoaded(true);
        }
      );
      const unsubscribeEarned = suggestRewarded.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          setSuggestRewardedLoaded(false);
          setSuggestRewardedSuccess(true);
          setSuggestRewarded(userInfo.user_id);
          Mixpanel.showAds({ category: "SUGGEST", ...reward });
        }
      );

      // Start loading the rewarded ad straight away
      suggestRewarded.load();

      // Unsubscribe from events on unmount
      return () => {
        unsubscribeLoaded();
        unsubscribeEarned();
      };
    }
  }, [status, suggestRewarded, userInfo]);

  React.useEffect(() => {
    (async () => {
      const { status } = await requestTrackingPermissionsAsync();
      if (status === "granted") {
        const idfa = getAdvertisingId();
        console.log(
          "Yay! I have user permission to track data, it's your IDFA:",
          idfa
        );
      }

      await mobileAds().setRequestConfiguration({
        // Update all future requests suitable for parental guidance
        maxAdContentRating: MaxAdContentRating.PG,

        // Indicates that you want your content treated as child-directed for purposes of COPPA.
        tagForChildDirectedTreatment: true,

        // Indicates that you want the ad request to be handled in a
        // manner suitable for users under the age of consent.
        tagForUnderAgeOfConsent: true,

        // An array of test device IDs to allow.
        testDeviceIdentifiers: ["EMULATOR"],
      });

      const adapterStatuses = await mobileAds().initialize();
      setStatus(!!adapterStatuses.length);
    })();
  }, []);
  return <></>;
};

const TrackingTransparencyWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return (
    <>
      {children}
      <RewardManager />
    </>
  );
};

export default TrackingTransparencyWrapper;
