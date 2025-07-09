import { getQueryData } from "@/hooks/useQuery";
import { scheduleNotification } from "@/services/notification";
import { getGroupKey } from "@/utils/string";
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
          console.warn(
            `Invalid maxNotificationsPerDay limit: ${limit}. Setting to 0.`
          );
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
      setupScheduledNotifications: async (groups) => {
        const { status } = await Notifications.getPermissionsAsync();
        if (status === "granted") {
          const maxDailyNotification = get().maxNotificationsPerDay;
          const _groups = groups.filter((g) => {
            const data = getQueryData<Group>(getGroupKey(g));
            return (data?.words?.length || 0) > 0;
          });
          if (_groups && _groups.length > 0) {
            const randomGroupIndex = Math.floor(Math.random() * _groups.length);
            const groupId = _groups[randomGroupIndex];

            const selectedGroup = getQueryData<Group>(getGroupKey(groupId));

            if (
              selectedGroup &&
              selectedGroup.words &&
              selectedGroup.words.length > 0
            ) {
              scheduleNotification(selectedGroup, maxDailyNotification);
            }
          }
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
