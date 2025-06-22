import { getUserPlayerRank } from "@/services/supabase";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type GameType =
  | "ChooseCorrect"
  | "SortCharacterGame"
  | "SpeakAndCompare"
  | "TypeCorrectFromVoice";

export interface GameSpecificData {
  totalQuestions: number;
  correctAnswers?: number;
  [key: string]: any; // For other future game-specific details
}

interface InfoState {
  history: GameHistory[];
  info: PlayerRank | null;
  isLoading: boolean;
  addGameResult: (result: GameHistory) => void;
  fetchCurrentInfo: () => Promise<void>;
}

const useInfoStore = create<InfoState>()(
  immer((set, get) => ({
    info: null,
    isLoading: false,
    history: [] as GameHistory[], // Explicitly type history here for immer
    totalScore: 0, // Initialize totalScore
    addGameResult: (result) =>
      set((state) => {
        state.history.unshift(result);
        // Increment totalScore with the new entry's score
        state.info!.total_score += result.score;
      }),
    async fetchCurrentInfo() {
      set((state) => {
        state.isLoading = true;
      });
      try {
        const { data } = await getUserPlayerRank();
        if (!!data) {
          set((state) => {
            state.info = data;
            state.isLoading = false;
          });
        }
      } catch (e) {
        set((state) => {
          state.isLoading = false;
        });
      }
    },
  }))
);

export default useInfoStore;
