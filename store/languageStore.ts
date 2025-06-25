import { downloadEngVieDictionaries } from "@/services/downloadDb";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type LanguageStore = {
  downloading: boolean;
  downloadSuccess: boolean;
  downloadHandle: () => Promise<void>;
  syncSuccess: () => void;
  language: string; // e.g., 'en', 'vn'
  setLanguage: (language: string) => void;
};

const useLanguageStore = create<LanguageStore, any>(
  devtools(
    persist(
      immer((set, get) => ({
        language: "vn", // Default language
        setLanguage: (language) => {
          set((state) => {
            state.language = language;
          });
        },
        downloading: false,
        downloadSuccess: false,
        async downloadHandle() {
          const _state = get();
          if (_state.downloading) {
            return;
          }
          set((state) => {
            state.downloading = true;
          });
          await downloadEngVieDictionaries();
          set((state) => {
            state.downloading = false;
          });
        },
        syncSuccess() {
          set((state) => {
            state.downloadSuccess = true;
          });
        },
      })),
      {
        name: "language-storage", // Key for AsyncStorage
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({
          downloadSuccess: state.downloadSuccess,
          language: state.language,
        }),
      }
    )
  )
);

export default useLanguageStore;
