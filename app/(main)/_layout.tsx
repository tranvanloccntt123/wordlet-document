import EnergyModal from "@/components/EnergyModal";
import NotificationWrapper from "@/components/NotificationWrapper";
import StatusBar from "@/components/StatusBar";
import TrackingTransparencyWrapper from "@/components/TrackingTransparencyWrapper";
import { syncOwnerGroup } from "@/services/groupServices";
import useGameStore from "@/store/gameStore";
import useInfoStore from "@/store/infoStore";
import useWordLearningStore from "@/store/wordLearningStore";
import { Stack } from "expo-router";
import React from "react";

const MainLayout = () => {
  const fetchUser = useGameStore((state) => state.fetchUser);
  const { fetchCurrentInfo } = useInfoStore();
  const fetchWordLearning = useWordLearningStore((state) => state.fetchData);
  React.useEffect(() => {
    fetchCurrentInfo();
    syncOwnerGroup();
    fetchUser();
    fetchWordLearning();
  }, []);

  return (
    <TrackingTransparencyWrapper>
      <NotificationWrapper>
        <StatusBar />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="games" />
          <Stack.Screen name="groups" />
          <Stack.Screen name="spell" />
          <Stack.Screen name="search" />
          <Stack.Screen name="settings" />
          <Stack.Screen
            name="game-over"
            options={{
              presentation: "transparentModal",
              animation: "fade",
            }}
          />
          <Stack.Screen name="leaderboard" />
          <Stack.Screen
            name="logout"
            options={{
              presentation: "transparentModal",
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="delete-account"
            options={{
              presentation: "transparentModal",
              animation: "fade",
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              presentation: "transparentModal",
              animation: "none",
            }}
          />
        </Stack>
        <EnergyModal />
      </NotificationWrapper>
    </TrackingTransparencyWrapper>
  );
};

export default MainLayout;
