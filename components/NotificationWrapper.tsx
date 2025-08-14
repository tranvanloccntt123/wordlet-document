import { registerForPushNotificationsAsync } from "@/services/notification";
import analytics from "@react-native-firebase/analytics"; // Recommended for FIAM
import inAppMessaging from "@react-native-firebase/in-app-messaging"; // FIAM module
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";

async function setupFIAM() {
  try {
    await inAppMessaging().setMessagesDisplaySuppressed(true);
    // Get Installation ID for testing
    const installationId = await analytics().getAppInstanceId();
    if (installationId) {
      console.log(
        "Firebase Installation ID for In-App Messaging testing:",
        installationId
      );
    } else {
      console.log(
        "Could not get Firebase Installation ID. Ensure Analytics is correctly set up."
      );
    }
  } catch (error) {
    console.error("Error setting up Firebase In-App Messaging:", error);
  }
}

const NotificationSetup: React.FC = () => {
  const timeOutToSetup = React.useRef<any>(null);
  const isFinished = React.useRef<boolean>(false);
  // const data = useWordLearningStore(state => state.data);

  // React.useEffect(() => {
  //   if (data?.length && !isFinished.current) {
  //     clearTimeout(timeOutToSetup.current);
  //     timeOutToSetup.current = setTimeout(() => {
  //       isFinished.current = true;
  //       // setupScheduledNotifications(data);
  //       //To confirm migration successfully
  //     }, 2000);
  //   }
  // }, [data]);
  return <></>;
};

const NotificationWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  React.useEffect(() => {
    registerForPushNotificationsAsync();
    setupFIAM();
  }, []);

  React.useEffect(() => {
    // Handle notification when app is in foreground
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log("MESSAGING: ", remoteMessage);
    });

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const url = response.notification.request.content.data.screen;
        if (url) {
          router.navigate({
            pathname: url as never,
          });
        }
      }
    );
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        Toast.show({
          type: "word",
          text1: notification?.request?.content?.title || "Notification",
          text2: notification?.request?.content?.body || "",
          onPress: () => {
            if (notification?.request?.content?.data?.screen) {
              router.navigate(notification.request.content.data.screen as any)
            }
          },
        });
      }
    );
    const unsubscribeBackground = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        const { data } = remoteMessage;
        if (data) {
          const url = data.screen;
          if (url) {
            router.navigate({
              pathname: url as never,
            });
          }
        }
      }
    );

    // Handle notification when app is opened from a quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage?.data) {
          const { data } = remoteMessage;
          if (data) {
            const url = data.screen;
            if (url) {
              router.navigate({
                pathname: url as never,
              });
            }
          }
        }
      });

    return () => {
      unsubscribeBackground();
      notificationListener.remove();
      subscription.remove();
    };
  }, []);
  return (
    <>
      {children}
      <NotificationSetup />
    </>
  );
};

export default NotificationWrapper;
