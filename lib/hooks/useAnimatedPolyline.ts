"use client";

import { useEffect, useRef, useState } from "react";

/** [longitude, latitude][] */
export function useAnimatedPolyline(
  coordinates: [number, number][],
  activeKey: string
) {
  const [pointCount, setPointCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const clearTimers = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      intervalRef.current = null;
      timeoutRef.current = null;
    };

    clearTimers();

    if (coordinates.length < 2) {
      setPointCount(coordinates.length);
      return clearTimers;
    }

    let index = 0;
    setPointCount(1);

    const run = () => {
      index = 0;
      setPointCount(1);

      intervalRef.current = setInterval(() => {
        if (index < coordinates.length - 1) {
          index += 1;
          setPointCount(index + 1);
        } else {
          clearTimers();
          timeoutRef.current = setTimeout(run, 1000);
        }
      }, 20);
    };

    run();
    return clearTimers;
  }, [coordinates, activeKey]);

  const animatedCoords = coordinates.slice(0, Math.max(pointCount, 1));

  return { animatedCoords, pointCount };
}
