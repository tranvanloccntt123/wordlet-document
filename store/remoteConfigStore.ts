import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface RemoteState {
  isConfigInitialized: boolean;
  setIsConfigInitialized: (_: boolean) => void;
}

const useRemoteConfigStore = create<RemoteState, any>( // Added 'any' for middleware compatibility like in other stores
  immer((set) => ({
    isConfigInitialized: false,
    setIsConfigInitialized(isConfigInitialized) {
      set((state) => {
        state.isConfigInitialized = isConfigInitialized;
      });
    },
  }))
);

export default useRemoteConfigStore;
