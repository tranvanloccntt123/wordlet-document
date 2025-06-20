import useRemoteConfigStore from "@/store/remoteConfigStore";
import remoteConfig from "@react-native-firebase/remote-config";
import React, { useEffect } from "react";

// Optional: Define a type for your remote config parameters if you have a clear structure
// interface AppRemoteConfigParams {
//   welcome_message: string;
//   is_new_feature_enabled: boolean;
//   item_limit: number;
// }

const RemoteConfigWrapper: React.FC<{
  children: React.ReactNode;
  onFinished: () => void;
}> = ({ children, onFinished }) => {
  const { isConfigInitialized, setIsConfigInitialized } =
    useRemoteConfigStore();

  useEffect(() => {
    const initializeRemoteConfig = async () => {
      try {
        // 1. Set default values
        // These are used if no values are fetched or if fetching fails.
        // Keys must match those in your Firebase Remote Config console.
        await remoteConfig().setDefaults({
          // Add other default parameters here
        });
        console.log("[RemoteConfig] Defaults set.");

        // 2. Set config settings (e.g., minimum fetch interval)
        // For development, 0 allows fetching every time.
        // For production, use a longer interval (e.g., 12 hours = 43200000 ms).
        const minimumFetchIntervalMillis = __DEV__ ? 0 : 43200000;
        await remoteConfig().setConfigSettings({
          minimumFetchIntervalMillis,
        });
        console.log(
          `[RemoteConfig] Fetch interval set to ${minimumFetchIntervalMillis}ms.`
        );

        // 3. Fetch and activate configuration
        const fetchedAndActivated = await remoteConfig().fetchAndActivate();

        if (fetchedAndActivated) {
          console.log("[RemoteConfig] Configs were fetched and activated.");
        } else {
          console.log(
            "[RemoteConfig] No new configs fetched or activated (using cached or defaults)."
          );
        }
      } catch (error) {
        console.error(
          "[RemoteConfig] Error initializing or fetching config:",
          error
        );
      } finally {
        setIsConfigInitialized(true);
        onFinished();
      }
    };

    initializeRemoteConfig();
  }, []);

  if (!isConfigInitialized) {
    // In a production app, you might show a global loading spinner or return null.
    return null;
  }

  return <>{children}</>;
};

export default RemoteConfigWrapper;
