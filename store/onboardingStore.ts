import dayjs from "dayjs";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface OnboardingState {
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (hasSeen: boolean) => void;
  checkAndOpenOnBoarding: (date: string) => void;
}

const useOnboardingStore = create<OnboardingState>()(
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
  }))
);

export default useOnboardingStore;
