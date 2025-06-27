import React from "react";
const useDebounce = <CallBackReturn = void>(options: { time: number }) => {
  const previousAbortController = React.useRef<AbortController | null>(null);
  const timer = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      previousAbortController.current?.abort();
    }
  }, []);

  return (
    callback: (abortController?: AbortController | null) => CallBackReturn
  ) => {
    clearTimeout(timer.current);
    previousAbortController?.current?.abort();
    timer.current = setTimeout(async () => {
      previousAbortController.current = new AbortController();
      callback(previousAbortController.current);
    }, options.time ?? 500);
  };
};

export default useDebounce;
