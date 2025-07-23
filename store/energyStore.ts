import * as supabase from "@/services/supabase";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface EnergyState {
  energy: number;
  suggest: number;
  isLoading: boolean;
  setEnergy: (energy: number) => void;
  setSuggest: (suggest: number) => void;
  fetchEnergy: (isRefresh?: boolean) => Promise<any>;
  isVisible: boolean;
  setIsVisible: (_: boolean) => void;
  increaseEnergyAfterReward: () => void;
}

export const energyStore = create<EnergyState>()(
  immer((set, get) => ({
    energy: 0,
    suggest: 0,
    isLoading: false,
    isVisible: false,
    increaseEnergyAfterReward() {
      set((state) => {
        state.energy += 2;
      });
    },
    setSuggest(suggest) {
      set((state) => {
        state.suggest = suggest;
      });
    },
    setEnergy(energy) {
      set((state) => {
        state.energy = energy;
      });
    },
    async fetchEnergy(isRefresh = false) {
      set((state) => {
        state.isLoading = true;
      });
      try {
        if (isRefresh) {
          supabase.clearEnergyFetching();
        }
        const { data, error } = await supabase.getEnergy();
        if (!error) {
          set((state) => {
            state.energy = data.energy;
            state.suggest = data.suggest;
            state.isLoading = false;
          });
        } else {
          set((state) => {
            state.isLoading = false;
          });
        }
      } catch (e) {
        set((state) => {
          state.isLoading = false;
        });
      }
    },
    setIsVisible(isVisible) {
      set((state) => {
        state.isVisible = isVisible;
      });
    },
  }))
);

const useEnergyStore = energyStore;

export default useEnergyStore;
