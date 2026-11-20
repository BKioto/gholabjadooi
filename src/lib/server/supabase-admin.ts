// مسیر فایل: src/lib/server/supabase-admin.ts
// اتصال «سرور» به دیتابیس با کلید مخفی (service_role).
// ⚠️ این فایل را هرگز در کامپوننت‌های کلاینت (فایل‌هایی که "use client" دارند) ایمپورت نکن.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY تنظیم نشده است (فایل .env.local و Vercel را چک کن).");
  }
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** صدا زدن یک تابع دیتابیس (RPC) و برگرداندن نتیجه. */
export async function rpc<T = unknown>(fn: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await getAdminClient().rpc(fn, args ?? {});
  if (error) throw new Error(`${fn}: ${error.message}`);
  return data as T;
}
