import AsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

type AuthState = {
  isLogged: boolean;
  setIsLogged: (_: boolean) => void;
  firebaseUser: FirebaseAuthTypes.User | null;
  setFirebaseUser: (_: FirebaseAuthTypes.User | null) => void;
};

export const authStore = create<AuthState>()(
  persist(
    immer((set) => ({
      isLogged: false,
      firebaseUser: null,
      setIsLogged(isLogged) {
        set((state) => {
          state.isLogged = isLogged;
        });
      },
      setFirebaseUser(firebaseUser) {
        set((state) => {
          state.firebaseUser = firebaseUser;
        });
      },
    })),
    {
      name: "auth-storage", // Unique name for this store in localStorage
      storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for React Native
      partialize(state) {
        return {
          isLogged: state.isLogged,
        };
      },
    }
  )
);

const useAuthStore = authStore;

export default useAuthStore;
