// مسیر فایل: src/app/api/bale/webhook/route.ts
// بله هر پیام/دکمه‌ی گروه را به این آدرس می‌فرستد.

import { safeEqual } from "@/lib/server/http";
import { handleUpdate } from "@/lib/server/inquiry-bot";
import type { BaleUpdate } from "@/lib/server/bale";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (!safeEqual(secret, process.env.BALE_WEBHOOK_SECRET)) {
    return new Response("forbidden", { status: 403 });
  }

  let update: BaleUpdate | null = null;
  try {
    update = (await request.json()) as BaleUpdate;
  } catch {
    update = null;
  }

  if (update && typeof update.update_id === "number") {
    try {
      await handleUpdate(update);
    } catch (e) {
      // همیشه ۲۰۰ برمی‌گردانیم تا بله پیام را بارها دوباره نفرستد
      console.error("[bale-webhook]", e instanceof Error ? e.message : e);
    }
  }
  return new Response("ok", { status: 200 });
}
