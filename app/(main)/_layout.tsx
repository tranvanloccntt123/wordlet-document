import EnergyModal from "@/components/EnergyModal";
import NotificationWrapper from "@/components/NotificationWrapper";
import StatusBar from "@/components/StatusBar";
import { syncOwnerGroup } from "@/services/groupServices";
import useGameStore from "@/store/gameStore";
import useInfoStore from "@/store/infoStore";
import { Stack } from "expo-router";
import React from "react";
import { Host } from "react-native-portalize";

const MainLayout = () => {
  const { fetchUser } = useGameStore();
  const { fetchCurrentInfo } = useInfoStore();
  React.useEffect(() => {
    fetchCurrentInfo();
    syncOwnerGroup();
    fetchUser();
  }, []);

  return (
    <Host>
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
    </Host>
  );
};

export default MainLayout;
