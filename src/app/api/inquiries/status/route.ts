// مسیر فایل: src/app/api/inquiries/status/route.ts
// صفحه‌ی سبد خرید هر چند ثانیه می‌پرسد: «جواب استعلام آمد؟»

import { after } from "next/server";
import { rpc } from "@/lib/server/supabase-admin";
import { isUuid, json, readJson } from "@/lib/server/http";
import { runMaintenanceThrottled } from "@/lib/server/inquiry-bot";

export const dynamic = "force-dynamic";

interface StatusResult {
  ok: boolean;
  inquiries: { status: string }[];
  storeOpen: boolean;
  serverTime: string;
}

export async function POST(request: Request) {
  const body = await readJson(request, 2_000);
  if (!body || !isUuid(body.token)) return json({ ok: false, reason: "bad_request" }, 400);
  try {
    const res = await rpc<StatusResult>("get_price_inquiries", { p_token: body.token });
    if (res.inquiries.some((i) => i.status === "waiting")) {
      // اگر چیزی در انتظار است: ارسال دوباره‌ی گیرکرده‌ها، یادآوری و ...
      after(async () => {
        try {
          await runMaintenanceThrottled();
        } catch (e) {
          console.error("[price-inquiry] maintenance:", e instanceof Error ? e.message : e);
        }
      });
    }
    return json(res);
  } catch (e) {
    console.error("[price-inquiry] status:", e instanceof Error ? e.message : e);
    return json({ ok: false, reason: "server_error" }, 500);
  }
}
