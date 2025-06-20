import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface QueriesData<T = any> {
  isLoading: boolean;
  isRefreshing: boolean;
  data: T;
  isError: boolean;
  error: any;
}

type FetchStore = {
  fetchData: Record<string, QueriesData>;
  fetch: (key: string, callback: () => Promise<any>) => Promise<void>;
  setData: (key: string, data: any) => void;
};

export const fetchStore = create<FetchStore, any>(
  immer((set, get) => ({
    fetchData: {},
    async fetch(key, callback) {
      const isRefresh = !!get().fetchData[key];
      set((state) => {
        state.fetchData[key] = {
          isLoading: true,
          isRefreshing: isRefresh ? true : false,
          data: null,
          isError: false,
          error: null,
        };
      });
      try {
        const res = await callback();
        set((state) => {
          state.fetchData[key].isLoading = false;
          state.fetchData[key].data = res;
          state.fetchData[key].isRefreshing = false;
        });
        return res;
      } catch (e) {
        set((state) => {
          state.fetchData[key].isLoading = false;
          state.fetchData[key].isError = true;
          state.fetchData[key].error = e;
          state.fetchData[key].isRefreshing = false;
        });
        throw e;
      }
    },
    setData(key, data) {
      try {
        const oldData = get().fetchData[key];
        set((state) => {
          state.fetchData[key] = {
            isLoading: oldData?.isLoading || false,
            isError: oldData?.isError || false,
            error: oldData?.error || null,
            isRefreshing: oldData?.isRefreshing || false,
            data: data,
          };
        });
      } catch (e) {}
    },
  }))
);

const useFetchStore = fetchStore;

export default useFetchStore;
