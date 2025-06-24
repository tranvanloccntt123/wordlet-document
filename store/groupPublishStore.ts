import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface GroupPublishState {
  lastUpdate: Date | null;
  setLastUpdate: (date: Date) => void;
  visibleCountDownModal: boolean;
  setVisibleCountDownModal: (visible: boolean) => void;
}

const useGroupPublishStore = create<GroupPublishState>()(
  immer((set, get) => ({
    lastUpdate: null,
    setLastUpdate(date) {
      set((state) => {
        state.lastUpdate = date;
      });
    },
    visibleCountDownModal: false,
    setVisibleCountDownModal(visible) {
      set((state) => {
        state.visibleCountDownModal = visible;
      });
    },
  }))
);

export default useGroupPublishStore;
