// مسیر فایل: src/lib/useIsClient.ts
// می‌فهمد کد الان در مرورگر اجرا می‌شود یا نه (برای جلوگیری از ناهماهنگی بین سرور و مرورگر).
"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
