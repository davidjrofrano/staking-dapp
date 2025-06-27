import { useEffect, useState } from "react";

export interface UseTimerReturn {
  timer: number;
}

export function useTimer(interval = 10000): UseTimerReturn {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const intervalId = setInterval((prev) => {
      setTimer(prev + 1);
    }, interval);
    return () => clearInterval(intervalId);
  }, [interval]);

  return { timer };
}
