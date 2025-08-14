import { fetchWordLearning } from "@/services/supabase/remember";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { notificationStore } from "./notificationStore";

type WordLearningStore = {
  data: WordRemember[];
  fetchData: () => Promise<void>;
  pushData: (_: WordRemember) => void;
  deleteData: (id: number) => void;
};

const useWordLearningStore = create<WordLearningStore, any>(
  immer((set, get) => ({
    data: [],
    animData: [],
    fetchData: async () => {
      "worklet";
      try {
        const res: PostgrestSingleResponse<WordRemember[]> =
          await fetchWordLearning();
        if (!res.error) {
          set((state) => {
            state.data = res.data;
          });
          notificationStore.getState().setupScheduledNotifications(res.data);
        }
      } catch (e) {
        console.log("Error fetching word learning data", e);
      }
    },
    pushData: (word: WordRemember) => {
      try {
        set((state) => {
          state.data.push(word);
        });
      } catch (e) {
        console.log("Error adding word learning data", e);
      }
    },
    deleteData: (id: number) => {
      set((state) => {
        state.data = state.data.filter((word) => word.id !== id);
      });
    },
  }))
);

export default useWordLearningStore;
