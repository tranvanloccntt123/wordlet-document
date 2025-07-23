import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface OnboardingState {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (hasSeen: boolean) => void;
  checkAndOpenOnBoarding: (date: string) => void;
}

const useOnboardingStore = create<OnboardingState>()(
  persist(
    immer((set) => ({
      hasSeenOnboarding: false,
      setHasSeenOnboarding: (hasSeen) => {
        set((state) => {
          state.hasSeenOnboarding = hasSeen;
        });
      },
      checkAndOpenOnBoarding(date) {
        set((state) => {
          state.hasSeenOnboarding = !state.hasSeenOnboarding
            ? dayjs(date).isSame(dayjs(), "day")
            : state.hasSeenOnboarding;
        });
      },
    })),
    {
      name: "onboarding-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useOnboardingStore;
