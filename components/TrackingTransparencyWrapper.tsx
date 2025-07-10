import {
    getAdvertisingId,
    requestTrackingPermissionsAsync,
} from "expo-tracking-transparency";
import React from "react";
// import mobileAds, { MaxAdContentRating } from "react-native-google-mobile-ads";

const TrackingTransparencyWrapper: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
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

    //   await mobileAds().setRequestConfiguration({
    //     // Update all future requests suitable for parental guidance
    //     maxAdContentRating: MaxAdContentRating.PG,

    //     // Indicates that you want your content treated as child-directed for purposes of COPPA.
    //     tagForChildDirectedTreatment: true,

    //     // Indicates that you want the ad request to be handled in a
    //     // manner suitable for users under the age of consent.
    //     tagForUnderAgeOfConsent: true,

    //     // An array of test device IDs to allow.
    //     testDeviceIdentifiers: ["EMULATOR"],
    //   });

    //   const adapterStatuses = await mobileAds().initialize();
    })();
  }, []);
  return <>{children}</>;
};

export default TrackingTransparencyWrapper;
