import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ConversationState {
  conversation: Conversation | null;
  timeline: Chat[];
  isWordPlaying: boolean;
  setConversation: (_: Conversation) => void;
  setTimeline: (_: Chat[]) => void;
  init: () => void;
  setIsWordPlaying: (_: boolean) => void;
  selectingTopic: boolean;
  setSelectingTopic: (_: boolean) => void;
}

const useConversationStore = create<ConversationState>()(
  immer((set, get) => ({
    conversation: null,
    timeline: [],
    isWordPlaying: false,
    selectingTopic: false,
    init() {
      set((state) => {
        state.conversation = null;
        state.timeline = [];
        state.isWordPlaying = false;
        state.selectingTopic = false;
      });
    },
    setConversation(conversation) {
      set((state) => {
        state.conversation = conversation;
      });
    },
    setTimeline(timeline) {
      set((state) => {
        state.timeline = timeline;
      });
    },
    setIsWordPlaying(isWordPlaying) {
      set((state) => {
        state.isWordPlaying = isWordPlaying;
      });
    },
    setSelectingTopic(selectingTopic) {
      set((state) => {
        state.selectingTopic = selectingTopic;
      });
    },
  }))
);

export default useConversationStore;
