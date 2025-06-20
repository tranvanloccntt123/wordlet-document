import useRemoteConfigStore from "@/store/remoteConfigStore";
import React from "react";

const RemoteConfigComponentWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const isConfigInitialized = useRemoteConfigStore(
    (state) => state.isConfigInitialized
  );
  return <>{isConfigInitialized ? children : null}</>;
};

export default RemoteConfigComponentWrapper;
