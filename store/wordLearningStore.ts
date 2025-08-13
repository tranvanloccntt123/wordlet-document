import { fetchWordLearning } from "@/services/supabase/remember";
import { PostgrestSingleResponse } from "@supabase/supabase-js";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type WordLearningStore = {
  data: WordRemember[];
  fetchData: () => Promise<void>;
  pushData: (_: WordRemember) => void;
  deleteData: (id: number) => void;
};

const useWordLearningStore = create<WordLearningStore, any>(
  immer((set, get) => ({
    data: [],
    fetchData: async () => {
      try {
        const res: PostgrestSingleResponse<WordRemember[]> =
          await fetchWordLearning();
        if (!res.error) {
          set((state) => {
            state.data = res.data;
          });
        }
      } catch (e) {
        console.log("Error fetching word learning data", e);
      }
    },
    pushData: async (word: WordRemember) => {
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
