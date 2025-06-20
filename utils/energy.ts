import { energyStore } from "@/store/energyStore";

export const energyCheck = (callback: () => void) => {
  energyStore.getState().energy > 0
    ? callback()
    : energyStore.getState().setIsVisible(true);
};
