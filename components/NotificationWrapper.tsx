import useQuery, { setQueryData } from "@/hooks/useQuery";
import { registerForPushNotificationsAsync } from "@/services/notification";
import { fetchOwnerGroup } from "@/services/supabase";
import useNotificationStore from "@/store/notificationStore";
import { getGroupKey, getOwnerGroup } from "@/utils/string";
import analytics from "@react-native-firebase/analytics"; // Recommended for FIAM
import inAppMessaging from "@react-native-firebase/in-app-messaging"; // FIAM module
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import React from "react";

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
  const { data: groups } = useQuery<number[]>({
    key: getOwnerGroup(),
    async queryFn() {
      const { error, data } = await fetchOwnerGroup();
      if (!error && !!data) {
        data.map((group) => setQueryData(getGroupKey(group.id), group));
        return data.map((v) => v.id);
      }
      return [];
    },
  });
  const { setupScheduledNotifications } = useNotificationStore();

  React.useEffect(() => {
    if (groups?.length) setupScheduledNotifications(groups);
  }, [groups]);
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
    return () => {
      unsubscribeBackground();
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
