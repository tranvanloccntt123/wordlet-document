import Colors from "@/constants/Colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type ThemeStore = {
  theme: string;
  colors: typeof Colors.dark | typeof Colors.dark;
  toggleTheme: () => void;
};

const useThemeStore = create<ThemeStore, any>(
  devtools(
    persist(
      immer((set, get) => ({
        theme: "light",
        colors: Colors.light,
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
      }
    )
  )
);

export default useThemeStore;
