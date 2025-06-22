import { getIPA } from "@/constants/Spell";
import { fetchWordsByKeywordList } from "@/services/searchDb";
import {
  createNewGame,
  fetchGroupDetail,
  getUsers
} from "@/services/supabase";
import { shuffleArray } from "@/utils/array";
import { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface GameState {
  user: User | null;
  history: GameHistory | null;
  group?: Group | null;
  currentIndex: number;
  isCalculating: boolean;
  isLoading: boolean;
  isLoadError: boolean;
  shuffledWords: Array<Omit<WordStore, "id">>;
  scores: number[];
  questionStartTime: number;
  gameType: GameType;
  init: (
    gameType: GameType,
    groupId?: number,
    ipaChar?: string
  ) => Promise<void>;
  start: () => void;
  next: () => void;
  submitAnswer: (answer: string | number, rate: number) => void;
  reset: () => void;
  fetchUser: () => Promise<void>;
}

const listWord = (ipaChar: string) => {
  const findVowels = getIPA().vowels.find((v) => v.sound === ipaChar);
  const findConsonant = getIPA().consonants.find((v) => v.sound === ipaChar);
  if (findVowels) {
    return findVowels.practice_words;
  }
  if (findConsonant) {
    return findConsonant.practice_words;
  }
  return [];
};

const useGameStore = create<GameState>()(
  immer((set, get) => ({
    user: null,
    history: null,
    currentIndex: 0,
    isLoading: true,
    isLoadError: false,
    shuffledWords: [],
    isCalculating: false,
    questionStartTime: 0,
    gameType: "ChooseCorrect",
    scores: [],
    reset() {
      set((state) => {
        state.history = null;
        state.currentIndex = 0;
        state.isLoading = true;
        state.isLoadError = false;
        state.shuffledWords = [];
        state.isCalculating = false;
        state.questionStartTime = 0;
        state.gameType = "ChooseCorrect";
        state.scores = [];
      });
    },
    init: async (gameType, groupId, ipaChar) => {
      set((state) => {
        state.questionStartTime = 0;
        state.isLoading = true;
        state.isLoadError = false;
        state.isCalculating = false;
        state.shuffledWords = [];
        state.gameType = gameType;
        state.currentIndex = 0;
      });
      if (groupId) {
        try {
          const { data, error } = await fetchGroupDetail(groupId);
          if (error || !data) {
            set((state) => {
              state.isLoadError = true;
              state.isLoading = false;
            });
            return;
          }
          const { data: gameData, error: gameError } = await createNewGame(
            groupId
          );
          if (gameError || !gameData.data.length) {
            set((state) => {
              state.isLoadError = true;
              state.isLoading = false;
            });
            return;
          }
          set((state) => {
            state.group = data;
            state.history = gameData.data[0];
            state.shuffledWords = shuffleArray([...data.words]);
            state.scores = Array.from(
              { length: data.words.length },
              (_, i) => 0
            );
            state.isLoading = false;
          });
        } catch (e) {
          set((state) => {
            state.isLoadError = true;
            state.isLoading = false;
          });
        }
      } else {
        try {
          const words = listWord(ipaChar ?? "");
          const tmpShuffleWords = shuffleArray(words);
          const listWords = await fetchWordsByKeywordList(
            tmpShuffleWords,
            "extra_mtb_ev.db"
          );
          const { data: gameData, error: gameError } = await createNewGame();
          if (gameError || !gameData.data.length) {
            set((state) => {
              state.isLoadError = true;
              state.isLoading = false;
            });
            return;
          }
          set((state) => {
            state.group = null;
            state.history = gameData.data[0];
            state.shuffledWords = shuffleArray([...listWords]).slice(0, 10);
            state.scores = Array.from({ length: 10 }, (_, i) => 0);
            state.isLoading = false;
          });
        } catch (e) {
          set((state) => {
            state.isLoadError = true;
            state.isLoading = false;
          });
        }
      }
    },
    start() {
      set((state) => {
        state.questionStartTime = Date.now();
      });
    },
    next() {
      set((state) => {
        state.currentIndex += 1;
        state.questionStartTime = Date.now();
      });
    },
    submitAnswer(answer, rate = 1) {
      set((state) => {
        if (
          [
            "ChooseCorrect",
            "SortCharacterGame",
            "TypeCorrectFromVoice",
          ].includes(state.gameType)
        ) {
          //correct answer
          if (
            (answer as string) === state.shuffledWords[state.currentIndex].word
          ) {
            //calculate score by time
            const timeTakenMs = Date.now() - state.questionStartTime;
            const seconds = timeTakenMs / 1000;
            state.scores[state.currentIndex] =
              (seconds < 10
                ? 100
                : seconds < 20
                ? 70
                : seconds < 40
                ? 50
                : seconds < 60
                ? 30
                : 10) * rate;
          } else {
            state.scores[state.currentIndex] = 0;
          }
          //next game after submitting
          // setTimeout(() => {
          //   state.currentIndex += 1;
          //   state.questionStartTime = Date.now();
          // }, 1500);
        } else {
          //speak game
          state.scores[state.currentIndex] = answer as number;
        }
      });
    },
    async fetchUser() {
      try {
        const r = await getUsers();
        set((state) => {
          state.user = r;
        });
      } catch (e) {}
    },
  }))
);

export default useGameStore;
