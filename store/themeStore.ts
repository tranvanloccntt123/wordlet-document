import Colors from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type ThemeStore = {
  theme: string;
  colors: typeof Colors.dark | typeof Colors.dark;
  toggleTheme: () => void;
  isSwappingTheme: boolean;
  setIsSwappingTheme: (_?: boolean) => void;
};

const useThemeStore = create<ThemeStore, any>(
  devtools(
    persist(
      immer((set, get) => ({
        theme: "light",
        colors: Colors.light,
        isSwappingTheme: false,
        setIsSwappingTheme(value) {
          set((state) => {
            state.isSwappingTheme = value === true;
          });
        },
        toggleTheme: () =>
          set((state) => {
            const newTheme = state.theme === "light" ? "dark" : "light";
            state.colors = Colors[newTheme];
            state.theme = newTheme;
          }),
      })),
      {
        name: "theme-storage", // Key for AsyncStorage
        storage: createJSONStorage(() => AsyncStorage),
        partialize: (state) => ({ theme: state.theme, colors: state.colors }),
      }
    )
  )
);

export default useThemeStore;
