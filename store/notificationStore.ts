import { scheduleNotificationWordLearning } from "@/services/notification";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export const notificationStore = create<
  NotificationStoreState<ScheduledNotificationItem>
>()(
  persist(
    immer((set, get) => ({
      dailyNotifications: {}, // Initialize as an empty object
      maxNotificationsPerDay: 2,
      setMaxNotificationsPerDay: (limit: number) => {
        if (limit < 0) {
          set((state) => {
            state.maxNotificationsPerDay = 0;
          });
        } else {
          set((state) => {
            state.maxNotificationsPerDay = limit;
          });
        }
      },

      clearAllNotifications: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        set((state) => {
          state.dailyNotifications = {};
        }); // Set to an empty object
      },
      setupScheduledNotifications: async (words) => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === "granted") {
          const maxDailyNotification = get().maxNotificationsPerDay;
          scheduleNotificationWordLearning(words, maxDailyNotification);
        }
      },
    })),
    {
      name: "notification-storage", // Unique name for this store in localStorage
      storage: createJSONStorage(() => AsyncStorage), // Use AsyncStorage for React Native
    }
  )
);

const useNotificationStore = notificationStore;

export default useNotificationStore;
