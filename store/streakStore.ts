import { formatDate, isYesterday } from "@/utils/date";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null; // Store date as 'YYYY-MM-DD' string
  streakHistory: string[]; // Store dates as 'YYYY-MM-DD' strings
  playGame: () => void;
}

const useStreakStore = create<StreakState, any>(
  devtools(
    // Optional: for Redux DevTools integration
    persist(
      immer((set) => ({
        currentStreak: 0,
        longestStreak: 0,
        lastPlayedDate: null,
        streakHistory: [],

        playGame: () =>
          set((state) => {
            const today = new Date();
            const todayFormatted = formatDate(today);

            if (state.lastPlayedDate === todayFormatted) {
              // Already played today, do nothing
              return;
            }

            if (state.lastPlayedDate === null || !isYesterday(state.lastPlayedDate)) {
              // First play or streak broken
              state.currentStreak = 1;
            } else {
              // Streak continues
              state.currentStreak += 1;
            }

            state.lastPlayedDate = todayFormatted;
            if (!state.streakHistory.includes(todayFormatted)) {
                 state.streakHistory.push(todayFormatted);
            }

            if (state.currentStreak > state.longestStreak) {
              state.longestStreak = state.currentStreak;
            }
          }),
      })),
      {
        name: "streak-storage", // Unique name for AsyncStorage
        storage: createJSONStorage(() => AsyncStorage),
        // partialize: (state) => ({ groups: state.groups }), // Uncomment if you only want to persist specific parts
      }
    )
  )
);

export default useStreakStore;
