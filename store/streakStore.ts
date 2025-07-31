import { fetchOwnerStreak, fetchStreakDays } from "@/services/supabase";
import { formatDate, isYesterday } from "@/utils/date";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface StreakState {
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null; // Store date as 'YYYY-MM-DD' string
  streakHistory: string[]; // Store dates as 'YYYY-MM-DD' strings
  playGame: () => void;
  fetchStreak: () => Promise<void>;
}

const useStreakStore = create<StreakState, any>(
  immer((set) => ({
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    streakHistory: [],
    fetchStreak: async () => {
      const { data } = await fetchOwnerStreak();
      const { data: streakDaysData } = await fetchStreakDays();
      if (data?.length) {
        set((state) => {
          state.currentStreak = data?.[0]?.current_streak || 0;
          state.lastPlayedDate =
            data?.[0]?.last_active_date || formatDate(new Date());
          if (streakDaysData?.length) {
            state.streakHistory = streakDaysData.map((v) => v.created_at);
          }
        });
      }
    },
    playGame: () =>
      set((state) => {
        const today = new Date();
        const todayFormatted = formatDate(today);

        if (state.lastPlayedDate === todayFormatted) {
          // Already played today, do nothing
          return;
        }

        if (
          state.lastPlayedDate === null ||
          !isYesterday(state.lastPlayedDate)
        ) {
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
  }))
);

export default useStreakStore;
