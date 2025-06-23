import { getQueryData } from "@/hooks/useQuery";
import { getFormattedDate, getGroupKey } from "@/utils/string";
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
          const dailyNotifications = { ...get().dailyNotifications };
          const maxDailyNotification = get().maxNotificationsPerDay;
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Normalize today's date to the beginning of the day
          const todayFormatted = getFormattedDate(today);
          Object.keys(dailyNotifications).forEach((dateString) => {
            if (dateString !== todayFormatted) {
              const pastDate = new Date(dateString);
              if (pastDate.getTime() < today.getTime()) {
                delete dailyNotifications[dateString];
              }
            }
          });
          if (groups && groups.length > 0) {
            const randomGroupIndex = Math.floor(Math.random() * groups.length);
            const groupId = groups[randomGroupIndex];

            const selectedGroup = getQueryData(getGroupKey(groupId));

            if (
              selectedGroup &&
              selectedGroup.words &&
              selectedGroup.words.length > 0
            ) {
              for (const wordObj of selectedGroup.words) {
                const now = new Date();

                // Define the notification window: 8:00:00 AM to 19:59:59 PM
                const windowStartHour = 8;
                const windowEndHour = 20; // Exclusive end for random generation up to 19:59:59

                // Create Date objects for the start and end of the window for today
                const todayWindowStart = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                  windowStartHour,
                  0,
                  0,
                  0
                );
                const todayWindowEnd = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                  windowEndHour,
                  0,
                  0,
                  0
                );

                // Calculate a random millisecond offset within the window duration
                const windowDurationMs =
                  todayWindowEnd.getTime() - todayWindowStart.getTime();
                const randomOffsetMs = Math.random() * windowDurationMs;

                // Determine the target timestamp for today
                const targetTimestampToday =
                  todayWindowStart.getTime() + randomOffsetMs;
                let targetNotificationDate = new Date(targetTimestampToday);

                targetNotificationDate.setDate(
                  targetNotificationDate.getDate() +
                    Math.floor(Math.random() * 30)
                );

                // Calculate the delay in seconds from now until the target notification time
                let triggerInSeconds = Math.floor(
                  (targetNotificationDate.getTime() - now.getTime()) / 1000
                );

                // Ensure the trigger is at least 0 seconds (e.g., if target is fractionally in the past due to timing)
                // or a small positive number if immediate triggers are problematic.
                triggerInSeconds = Math.max(0, triggerInSeconds);

                // Log the target date and time before scheduling

                if (
                  !dailyNotifications[getFormattedDate(targetNotificationDate)]
                ) {
                  dailyNotifications[getFormattedDate(targetNotificationDate)] =
                    [];
                }

                if (
                  dailyNotifications[getFormattedDate(targetNotificationDate)]
                    .length < maxDailyNotification
                ) {
                  const payload = {
                    title: `${wordObj.word}`,
                    body: `${wordObj.content
                      .replace("1#", " ")
                      .replace("5#", "")}`,
                    data: {
                      word: wordObj.word,
                      groupId: `${selectedGroup.id}`,
                      screen: `/word/${encodeURIComponent(
                        wordObj.source
                      )}/${encodeURIComponent(wordObj.word)}/detail`,
                    }, // Optional: useful for handling notification tap
                  };
                  try {
                    const identifiy =
                      await Notifications.scheduleNotificationAsync({
                        content: payload,
                        trigger: {
                          type: Notifications.SchedulableTriggerInputTypes
                            .TIME_INTERVAL,
                          seconds: triggerInSeconds,
                          repeats: false, // Show once per word for this scheduling session
                        },
                      });
                    dailyNotifications[
                      getFormattedDate(targetNotificationDate)
                    ].push({
                      id: identifiy,
                      payload: payload,
                      scheduledTimestamp: targetNotificationDate.getTime(),
                    });
                    set((state) => {
                      state.dailyNotifications = { ...dailyNotifications };
                    });
                  } catch (error) {
                    // console.warn(
                    //   `Failed to schedule notification for word "${wordObj.word}":`,
                    //   error
                    // );
                  }
                }
              }
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
