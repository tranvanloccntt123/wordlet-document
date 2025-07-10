import EnergyModal from "@/components/EnergyModal";
import NotificationWrapper from "@/components/NotificationWrapper";
import StatusBar from "@/components/StatusBar";
import TrackingTransparencyWrapper from "@/components/TrackingTransparencyWrapper";
import { syncOwnerGroup } from "@/services/groupServices";
import useGameStore from "@/store/gameStore";
import useInfoStore from "@/store/infoStore";
import { Stack } from "expo-router";
import React from "react";

const MainLayout = () => {
  const fetchUser = useGameStore((state) => state.fetchUser);
  const { fetchCurrentInfo } = useInfoStore();
  React.useEffect(() => {
    fetchCurrentInfo();
    syncOwnerGroup();
    fetchUser();
  }, []);

  return (
    <TrackingTransparencyWrapper>
      <NotificationWrapper>
        <StatusBar />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="game-over"
            options={{
              presentation: "transparentModal",
              animation: "fade",
            }}
          />
          <Stack.Screen name="leaderboard" />
        </Stack>
        <EnergyModal />
      </NotificationWrapper>
    </TrackingTransparencyWrapper>
  );
};

export default MainLayout;
