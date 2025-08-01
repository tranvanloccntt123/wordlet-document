import { getUserInfo, getUserSocialInfo } from "@/services/supabase";
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
  info: UserInfo | null;
  socialInfo: SocialUser | null;
  history: GameHistory[];
  isLoading: boolean;
  addGameResult: (result: GameHistory) => void;
  fetchCurrentInfo: () => Promise<void>;
  clearData: () => void;
}

const infoStore = create<InfoState>()(
  immer((set, get) => ({
    info: null,
    socialInfo: null,
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
        const { data: userInfo } = await getUserInfo();
        if (!!userInfo) {
          set((state) => {
            state.info = userInfo;
          });
        }
        const { data: socialInfo } = await getUserSocialInfo();
        if (!!socialInfo) {
          set((state) => {
            state.socialInfo = socialInfo;
          });
        }
      } catch (e) {
      } finally {
        set((state) => {
          state.isLoading = false;
        });
      }
    },
    clearData() {
      set((state) => {
        state.info = null;
        state.history = [];
        state.socialInfo = null;
      });
    },
  }))
);

const useInfoStore = infoStore;

export default useInfoStore;
