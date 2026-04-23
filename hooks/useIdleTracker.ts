import { useEffect, useRef, useCallback, useState } from "react";

const AWAY_THRESHOLD_MS = 10 * 60 * 1000; // 10 min before we care
const IDLE_GRACE_MS = 2 * 60 * 1000; // active in last 2 min = probably coding

export interface AwaySession {
  awayAt: Date;
  returnedAt: Date;
  durationSeconds: number;
}

export function useIdleTracker() {
  const hiddenAt = useRef<Date | null>(null);
  const lastActivityAt = useRef<number>(Date.now());
  const awayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thresholdMet = useRef(false);

  const [nudge, setNudge] = useState<AwaySession | null>(null);

  // Track browser activity
  useEffect(() => {
    const resetActivity = () => {
      lastActivityAt.current = Date.now();
    };
    document.addEventListener("mousemove", resetActivity);
    document.addEventListener("keydown", resetActivity);
    document.addEventListener("click", resetActivity);
    return () => {
      document.removeEventListener("mousemove", resetActivity);
      document.removeEventListener("keydown", resetActivity);
      document.removeEventListener("click", resetActivity);
    };
  }, []);

  const dismissNudge = useCallback(() => setNudge(null), []);

  const confirmAway = useCallback(async (session: AwaySession) => {
    setNudge(null);
    await fetch("/api/away-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        away_at: session.awayAt.toISOString(),
        returned_at: session.returnedAt.toISOString(),
        duration_seconds: session.durationSeconds,
        pomodoro_was_paused: false,
      }),
    });
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        const timeSinceActive = Date.now() - lastActivityAt.current;
        // Skip if they were recently active — probably just coding
        if (timeSinceActive < IDLE_GRACE_MS) return;

        hiddenAt.current = new Date();
        thresholdMet.current = false;

        awayTimer.current = setTimeout(() => {
          thresholdMet.current = true;
        }, AWAY_THRESHOLD_MS);
      } else {
        if (awayTimer.current) clearTimeout(awayTimer.current);

        if (hiddenAt.current && thresholdMet.current) {
          const returnedAt = new Date();
          const durationSeconds = Math.floor(
            (returnedAt.getTime() - hiddenAt.current.getTime()) / 1000,
          );
          // Show the nudge — don't log anything yet
          setNudge({ awayAt: hiddenAt.current, returnedAt, durationSeconds });
        }

        hiddenAt.current = null;
        thresholdMet.current = false;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (awayTimer.current) clearTimeout(awayTimer.current);
    };
  }, []);

  return { nudge, confirmAway, dismissNudge };
}
