"use client";

export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const result = await Notification.requestPermission();
  return result === "granted";
}

export function sendNotification(
  title: string,
  body: string,
  icon = "/favicon.ico",
) {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;
  new Notification(title, { body, icon });
}

export function scheduleDailyNotification(
  hour: number,
  minute: number,
  getMessage: () => string,
) {
  if (typeof window === "undefined") return;

  function scheduleNext() {
    const now = new Date();
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const delay = next.getTime() - now.getTime();

    setTimeout(() => {
      sendNotification("🗓️ Dev Daily — Today's Plan", getMessage());
      scheduleNext(); // reschedule for next day
    }, delay);
  }

  scheduleNext();
}
