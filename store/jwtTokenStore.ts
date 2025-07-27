import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type JWTTokenStore = {
  socialToken: string | null;
  wordletToken: string | null;
  setSocialToken: (_: string) => Promise<void>;
  setWordletToken: (_: string) => Promise<void>;
};

export const authStore = create<JWTTokenStore>()(
  persist(
    immer((set) => ({
      socialToken: null,
      wordletToken: null,
      async setSocialToken(token) {
        set((state) => {
          state.socialToken = token;
        });
      },
      async setWordletToken(token) {
        set((state) => {
          state.wordletToken = token;
        });
      },
    })),
    {
      name: "auth-storage", // Unique name for this store in localStorage
      storage: createJSONStorage(() => ({
        async getItem(name) {
          let result = await SecureStore.getItemAsync(name);
          return result;
        },
        async setItem(name, value) {
          await SecureStore.setItemAsync(name, value);
        },
        async removeItem(name) {
          await SecureStore.deleteItemAsync(name);
        },
      })), // Use AsyncStorage for React Native
    }
  )
);

const useAuthStore = authStore;

export default useAuthStore;
