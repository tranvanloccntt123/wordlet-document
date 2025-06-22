import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { Alert, Platform } from "react-native";
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
    Alert.alert(
      "Enable Notifications",
      "To receive updates and alerts, please enable notifications in your device settings."
    );
    return;
  }

  await messaging().registerDeviceForRemoteMessages();
  const token = await messaging().getToken();
  updateFCMToken(token);
  // You can get the Expo Push Token here if you plan to send push notifications from a server
  // const token = (await Notifications.getExpoPushTokenAsync()).data;
  // console.log("Expo Push Token:", token);
};
