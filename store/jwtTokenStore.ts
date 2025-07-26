import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type JWTTokenStore = {
  social: string | null;
  setSocialToken: (_: string) => void;
};

export const authStore = create<JWTTokenStore>()(
  persist(
    immer((set) => ({
      social: null,
      setSocialToken(token) {
        set((state) => {
          state.social = token;
        });
      },
    })),
    {
      name: "auth-storage", // Unique name for this store in localStorage
      storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for React Native
      partialize(state) {
        return {};
      },
    }
  )
);

const useAuthStore = authStore;

export default useAuthStore;
