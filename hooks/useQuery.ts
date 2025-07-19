import useFetchStore, { fetchStore } from "@/store/fetchStore";
import React from "react";

/**
 * @name useQuery
 * @param key string
 * @param disableCache boolean
 * @param queryFn Promise function
 * @param gcTime ms - default 5 minutes
 */
const useQuery = <T = any>({
  key,
  queryFn,
  disableCache,
  gcTime = 300000,
}: {
  key: string;
  queryFn?: () => Promise<T>;
  disableCache?: boolean;
  gcTime?: number;
}) => {
  const fetch = useFetchStore((state) => state.fetch);
  const data = useFetchStore((state) => state.fetchData?.[key]?.data ?? null);
  const isError = useFetchStore(
    (state) => state.fetchData?.[key]?.isError ?? false
  );
  const isLoading = useFetchStore(
    (state) => state.fetchData?.[key]?.isLoading ?? false
  );
  const isRefreshing = useFetchStore(
    (state) => state.fetchData?.[key]?.isRefreshing ?? false
  );
  const error = useFetchStore((state) => state.fetchData?.[key]?.error ?? null);
  const lastFetch = useFetchStore(
    (state) => state.fetchData?.[key]?.lastFetch ?? null
  );

  const fetchData = async () => {
    if (
      (!data ||
        disableCache ||
        (lastFetch !== null && Date.now() - lastFetch.getTime() > gcTime)) &&
      !!queryFn
    ) {
      fetch(key, queryFn);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  return {
    data: data as T,
    isLoading,
    isError,
    isRefreshing,
    error,
    refetch: fetchData,
  };
};

export const setQueryData = async <T = any>(
  key: string,
  updater?: T | Updater<T | undefined>,
  validator?: (data: T | undefined) => Promise<boolean>
) => {
  const setData = fetchStore.getState().setData;
  const oldData = fetchStore.getState().fetchData[key]?.data;
  let newData: T | undefined;
  if (typeof updater === "function") {
    newData = (updater as Updater<T>)(oldData as T);
  } else {
    newData = updater;
  }
  if (validator && !(await validator(newData))) {
    return;
  }
  setData(key, newData);
  return newData;
};

export const getQueryData = <T = any>(key: string) => {
  const data = fetchStore.getState().fetchData[key]?.data;
  return data as T | undefined | null;
};

export default useQuery;
