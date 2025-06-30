import * as supabase from "@/services/supabase";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface EnergyState {
  energy: number;
  isLoading: boolean;
  setEnergy: (energy: number) => void;
  fetchEnergy: (isRefresh?: boolean) => Promise<any>;
  isVisible: boolean;
  setIsVisible: (_: boolean) => void;
}

export const energyStore = create<EnergyState>()(
  immer((set, get) => ({
    energy: 0,
    isLoading: false,
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
    isVisible: false,
    setIsVisible(isVisible) {
      set((state) => {
        state.isVisible = isVisible;
      });
    },
  }))
);

const useEnergyStore = energyStore;

export default useEnergyStore;
