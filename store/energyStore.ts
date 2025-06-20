import * as supabase from "@/services/supabase";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface EnergyState {
  energy: number;
  isLoading: boolean;
  fetchEnergy: () => Promise<any>;
  isVisible: boolean;
  setIsVisible: (_: boolean) => void;
}

export const energyStore = create<EnergyState>()(
  immer((set, get) => ({
    energy: 0,
    isLoading: false,
    async fetchEnergy() {
      set((state) => {
        state.isLoading = true;
      });
      try {
        const { data, error } = await supabase.getEnergy();
        if (!error) {
          set((state) => {
            state.energy = data.energy;
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
