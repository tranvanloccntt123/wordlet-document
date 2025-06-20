import {
  fetchVowelPercent,
  insertVowelPercent,
  updateVowelPercent,
} from "@/services/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface SpellState {
  percent: Record<string, number>;
  setPercent: (char: string, percent: number) => void;
  reset: () => void;
  fetchCurrentSpellStore: () => Promise<void>;
}

const useSpellStore = create<SpellState>()(
  persist(
    immer((set, get) => ({
      percent: {},
      setPercent(char, percent) {
        const storePercent = get().percent[char];
        if (storePercent) {
          updateVowelPercent(char, percent);
        } else {
          insertVowelPercent(char, percent);
        }
        set((state) => {
          state.percent[char] = percent;
        });
      },
      reset: () => {
        set((state) => {
          state.percent = {};
        });
      },
      fetchCurrentSpellStore: async () => {
        try {
          const res = await fetchVowelPercent();
          if (res.error) {
            throw "Failed to fetch vowel percent";
          }
          set((state) => {
            state.percent = res.data.reduce(
              (prev, currentData) => ({
                ...prev,
                [currentData.char]: currentData.percent,
              }),
              {}
            );
          });
        } catch (e) {}
      },
    })),
    {
      name: "spell-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ percent: state.percent }),
    }
  )
);

export default useSpellStore;
