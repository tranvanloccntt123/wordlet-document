import { formatDate } from "@/utils/date";
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { openDatabaseAsync } from "expo-sqlite";
import { t } from "i18next";
import { Platform } from "react-native";
import Toast from "react-native-toast-message";
import { updateFCMToken } from "./supabase";

export const registerForPushNotificationsAsync = async () => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C", // You can use a color from your theme if you prefer
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    Toast.show({
      type: "error",
      text1: t("settings.enableNotification", "Enable Notifications"),
      text2: t(
        "settings.enableNotificationMessage",
        "To receive updates and alerts, please enable notifications in your device settings."
      ),
    });
    return;
  }

  await messaging().registerDeviceForRemoteMessages();
  const token = await messaging().getToken();
  updateFCMToken(token);
  // You can get the Expo Push Token here if you plan to send push notifications from a server
  // const token = (await Notifications.getExpoPushTokenAsync()).data;
  // console.log("Expo Push Token:", token);
};

// Function to count notifications for a specific date
export const countNotificationsPerDay = async (
  date: string
): Promise<Array<{ date: string; notification_count: number }>> => {
  const db = await openDatabaseAsync("teiresource.db", {
    useNewConnection: true,
  });
  try {
    const result = await db.getAllAsync(
      `
      SELECT created_at AS notification_date, COUNT(*) AS notification_count
      FROM local_notifications
      WHERE created_at = ?
      GROUP BY created_at;
    `,
      [date]
    );
    return result as Array<{ date: string; notification_count: number }>; // Returns an array with the count for the specified date
  } catch (error) {
    console.error("Error counting notifications for date:", error);
    throw error;
  }
};

// Function to insert a notification record
export const insertNotification = async (
  created_at: string,
  content: string,
  title: string,
  source: string
) => {
  // Validate inputs
  if (!/^\d{4}-\d{2}-\d{2}$/.test(created_at)) {
    throw new Error("created_at must be in YYYY-MM-DD format");
  }
  if (typeof content !== "string" || content.trim() === "") {
    throw new Error("content must be a non-empty string");
  }
  if (typeof title !== "string" || title.trim() === "") {
    throw new Error("title must be a non-empty string");
  }

  // Connect to the database
  const db = await openDatabaseAsync("teiresource.db", {
    useNewConnection: true,
  });
  try {
    await db.runAsync(
      "INSERT INTO local_notifications (created_at, content, title, source) VALUES (?, ?, ?, ?)",
      [created_at, content, title, source]
    );
    return { success: true, message: "Notification inserted successfully" };
  } catch (error) {
    console.error("Error inserting notification:", error);
    throw error;
  }
};

export const scheduleNotification = async (group: Group, limit: number) => {
  if (group.words.length === 0 || !limit) return;
  for (const wordObj of group.words) {
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
    const targetTimestampToday = todayWindowStart.getTime() + randomOffsetMs;
    let targetNotificationDate = new Date(targetTimestampToday);

    targetNotificationDate.setDate(
      targetNotificationDate.getDate() + Math.floor(Math.random() * 30)
    );

    // Calculate the delay in seconds from now until the target notification time
    let triggerInSeconds = Math.floor(
      (targetNotificationDate.getTime() - now.getTime()) / 1000
    );

    // Ensure the trigger is at least 0 seconds (e.g., if target is fractionally in the past due to timing)
    // or a small positive number if immediate triggers are problematic.
    triggerInSeconds = Math.max(0, triggerInSeconds);

    // Log the target date and time before scheduling

    const notificationsPerDay = await countNotificationsPerDay(
      formatDate(targetNotificationDate)
    );

    if (
      !notificationsPerDay?.length ||
      notificationsPerDay[0].notification_count < limit
    ) {
      //notification is available
      const payload = {
        title: `${wordObj.word}`,
        body: `${wordObj.content.replace("1#", " ").replace("5#", "")}`,
        data: {
          word: wordObj.word,
          groupId: `${group.id}`,
          screen: `/word/${encodeURIComponent(
            wordObj.source
          )}/${encodeURIComponent(wordObj.word)}/detail`,
        }, // Optional: useful for handling notification tap
      };
      await insertNotification(
        formatDate(targetNotificationDate),
        payload.body,
        payload.title,
        wordObj.source
      );
      await Notifications.scheduleNotificationAsync({
        content: payload,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerInSeconds,
          repeats: false, // Show once per word for this scheduling session
        },
      });
    }
  }
};

export const scheduleNotificationWordLearning = async (
  words: WordRemember[],
  limit: number
) => {
  for (const word of words) {
    const wordObj = word.word;
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
    const targetTimestampToday = todayWindowStart.getTime() + randomOffsetMs;
    let targetNotificationDate = new Date(targetTimestampToday);

    targetNotificationDate.setDate(
      targetNotificationDate.getDate() + Math.floor(Math.random() * 30)
    );

    // Calculate the delay in seconds from now until the target notification time
    let triggerInSeconds = Math.floor(
      (targetNotificationDate.getTime() - now.getTime()) / 1000
    );

    // Ensure the trigger is at least 0 seconds (e.g., if target is fractionally in the past due to timing)
    // or a small positive number if immediate triggers are problematic.
    triggerInSeconds = Math.max(0, triggerInSeconds);

    // Log the target date and time before scheduling

    const notificationsPerDay = await countNotificationsPerDay(
      formatDate(targetNotificationDate)
    );

    if (
      !notificationsPerDay?.length ||
      notificationsPerDay[0].notification_count < limit
    ) {
      //notification is available
      const payload = {
        title: `${wordObj.word}`,
        body: `${wordObj.content.replace("1#", " ").replace("5#", "")}`,
        data: {
          word: wordObj.word,
          screen: `/word/${encodeURIComponent(
            wordObj.source
          )}/${encodeURIComponent(wordObj.word)}/detail`,
        }, // Optional: useful for handling notification tap
      };
      await insertNotification(
        formatDate(targetNotificationDate),
        payload.body,
        payload.title,
        wordObj.source
      );
      await Notifications.scheduleNotificationAsync({
        content: payload,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerInSeconds,
          repeats: false, // Show once per word for this scheduling session
        },
      });
    }
  }
};
