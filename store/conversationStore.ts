import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ConversationState {
  conversation: Conversation | null;
  timeline: Chat[];
  isWordPlaying: boolean;
  unlocked: Record<number, string>;
  selectingTopic: boolean;
  setConversation: (_: Conversation) => void;
  setTimeline: (_: Chat[]) => void;
  init: () => void;
  setIsWordPlaying: (_: boolean) => void;
  setSelectingTopic: (_: boolean) => void;
  pushUnlocked: (_: { conversation_id: number; created_at: string }[]) => void;
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
    unlocked: {},
    pushUnlocked(unlocked) {
      set((state) => {
        state.unlocked = {
          ...state.unlocked,
          ...unlocked.reduce((acc: any, item) => {
            acc[item.conversation_id] = item.created_at;
            return acc;
          }, {}),
        };
      });
    },
  }))
);

export default useConversationStore;
