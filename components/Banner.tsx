import useInfoStore from "@/store/infoStore";
import React from "react";
import { Platform } from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from "react-native-google-mobile-ads";
const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-3212595540202226/1267887544";

const WordletBanner: React.FC<{ banner?: BannerAdSize | string }> = ({
  banner,
}) => {
  const { info, isLoading } = useInfoStore();
  const bannerRef = React.useRef<BannerAd>(null);
  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load();
  });
  return (
    (!isLoading || !info?.is_premium) && (
      <BannerAd
        ref={bannerRef}
        unitId={adUnitId}
        size={banner ?? BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    )
  );
};

export default WordletBanner;
