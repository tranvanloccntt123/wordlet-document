import useFetchStore, { fetchStore } from "@/store/fetchStore";
import React from "react";

const useQuery = <T = any>({
  key,
  queryFn,
  disableCache,
}: {
  key: string;
  queryFn: () => Promise<T>;
  disableCache?: boolean;
}) => {
  const fetch = useFetchStore((state) => state.fetch);
  const { data, isError, isLoading, isRefreshing, error } = useFetchStore(
    (state) =>
      state.fetchData[key] || {
        isLoading: true,
        isRefreshing: false,
        data: null,
        isError: false,
        error: null,
      }
  );

  React.useEffect(() => {
    if (!disableCache && !data) fetch(key, queryFn);
  }, []);

  return {
    data: data as T,
    isLoading,
    isError,
    isRefreshing,
    error,
    refetch: async () => await fetch(key, queryFn),
  };
};

export const setQueryData = <T = any>(
  key: string,
  updater?: T | Updater<T | undefined>
) => {
  const setData = fetchStore.getState().setData;
  const oldData = fetchStore.getState().fetchData[key]?.data;
  let newData: T | undefined;
  if (typeof updater === "function") {
    newData = (updater as Updater<T>)(oldData as T);
  } else {
    newData = updater;
  }
  setData(key, newData);
  return newData;
};

export const getQueryData = <T = any>(key: string) => {
  const data = fetchStore.getState().fetchData[key]?.data;
  return data as T | undefined | null;
};

export default useQuery;
