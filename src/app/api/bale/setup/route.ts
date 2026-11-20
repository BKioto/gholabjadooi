// مسیر فایل: src/app/api/bale/setup/route.ts
// صفحه‌ی راه‌اندازی و بررسی سلامت ربات (فقط با کلید مخصوص باز می‌شود).
// آدرس: https://www.gholabjadooi.ir/api/bale/setup?key=<BALE_WEBHOOK_SECRET>

import { SITE_URL } from "@/lib/seo";
import { getAdminClient } from "@/lib/server/supabase-admin";
import { safeEqual } from "@/lib/server/http";
import { getBotSettings } from "@/lib/server/inquiry-bot";
import { getMe, sendMessage, setWebhook } from "@/lib/server/bale";
import { formatCardNumber } from "@/lib/price-utils";

export const dynamic = "force-dynamic";

const esc = (s: unknown): string =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

interface Check {
  title: string;
  ok: boolean;
  message: string;
  todo?: string;
}

function page(body: string, status = 200): Response {
  const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>راه‌اندازی ربات استعلام قیمت</title>
<style>
  *{box-sizing:border-box}
  body{margin:0;background:#CFECF3;color:#374151;font-family:Vazirmatn,Tahoma,system-ui,sans-serif;line-height:1.9;padding:24px 14px}
  .wrap{max-width:640px;margin:0 auto}
  h1{font-size:26px;margin:0 0 6px}
  .sub{margin:0 0 22px;color:#4b5563}
  .card{background:#fff;border-radius:22px;padding:18px 20px;margin-bottom:14px;box-shadow:0 2px 10px rgba(0,0,0,.06);border:2px solid transparent}
  .card.ok{border-color:#86efac}
  .card.bad{border-color:#fca5a5}
  .row{display:flex;gap:12px;align-items:flex-start}
  .ico{font-size:26px;line-height:1.4}
  .t{font-weight:700;font-size:18px}
  .m{color:#4b5563;font-size:15px}
  .todo{margin-top:10px;background:#fff7ed;border-radius:14px;padding:12px 14px;font-size:15px}
  code{direction:ltr;unicode-bidi:embed;display:inline-block;background:#f3f4f6;border-radius:8px;padding:2px 8px;font-family:Consolas,monospace;font-size:15px;user-select:all}
  .final{font-size:20px;font-weight:700;text-align:center;padding:18px}
  .final.ok{background:#DAF9DE;border-radius:22px}
  .btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
  a.btn{display:inline-block;background:#FF6B81;color:#fff;text-decoration:none;font-weight:700;padding:12px 20px;border-radius:16px}
  a.btn.alt{background:#fff;color:#374151;border:2px solid #d1d5db}
</style>
</head>
<body><div class="wrap">${body}</div></body></html>`;
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = process.env.BALE_WEBHOOK_SECRET;
  if (!secret) {
    return page(
      `<h1>راه‌اندازی ربات</h1><div class="card bad"><div class="t">❌ BALE_WEBHOOK_SECRET تنظیم نشده</div>
       <div class="m">این مقدار را در فایل <code>.env.local</code> و در Vercel اضافه کن و سایت را دوباره دیپلوی کن.</div></div>`,
      500
    );
  }
  if (!safeEqual(url.searchParams.get("key"), secret)) {
    return page(`<h1>دسترسی ندارید</h1><p class="sub">آدرس را کامل و دقیق (همراه کلید) باز کن.</p>`, 403);
  }

  const checks: Check[] = [];
  const base = `${url.pathname}?key=${encodeURIComponent(secret)}`;

  // ۱) دیتابیس
  let chatId: string | null = null;
  let setupCode = "";
  try {
    const settings = await getBotSettings();
    chatId = settings.chat_id;
    setupCode = settings.setup_code;
    checks.push({ title: "اتصال سایت به دیتابیس", ok: true, message: "درست کار می‌کند." });
  } catch (e) {
    checks.push({
      title: "اتصال سایت به دیتابیس",
      ok: false,
      message: e instanceof Error ? e.message : "خطا",
      todo: "کلید <code>SUPABASE_SERVICE_ROLE_KEY</code> را دوباره از Supabase کپی کن و در <code>.env.local</code> و Vercel بگذار.",
    });
  }

  // ۲) ربات
  let botOk = false;
  try {
    const me = await getMe();
    botOk = true;
    checks.push({ title: "ربات بله", ok: true, message: `ربات پیدا شد: ${me.username ? "@" + me.username : me.first_name ?? "ربات"}` });
  } catch (e) {
    checks.push({
      title: "ربات بله",
      ok: false,
      message: e instanceof Error ? e.message : "خطا",
      todo: "توکن ربات را دوباره از بات‌فادر کپی کن و در <code>BALE_BOT_TOKEN</code> بگذار.",
    });
  }

  // ۳) وب‌هوک
  if (botOk) {
    try {
      await setWebhook(`${SITE_URL}/api/bale/webhook?secret=${encodeURIComponent(secret)}`);
      checks.push({ title: "اتصال بله به سایت", ok: true, message: "ثبت شد؛ از حالا بله پیام‌ها را به سایت می‌رساند." });
    } catch (e) {
      checks.push({
        title: "اتصال بله به سایت",
        ok: false,
        message: e instanceof Error ? e.message : "خطا",
        todo: "چند دقیقه بعد همین صفحه را دوباره باز کن. اگر باز هم قرمز بود به من خبر بده.",
      });
    }
  }

  // ۴) گروه
  if (chatId) {
    checks.push({ title: "گروه استعلام قیمت", ok: true, message: "گروه ثبت شده است." });
  } else {
    checks.push({
      title: "گروه استعلام قیمت",
      ok: false,
      message: "هنوز گروهی ثبت نشده.",
      todo: `ربات را عضو گروه کن و داخل گروه این پیام را بفرست:<br><code>/register ${esc(setupCode)}</code><br>بعد همین صفحه را دوباره باز کن.`,
    });
  }

  // ۵) کارت
  let cardSet = false;
  try {
    const { data } = await getAdminClient().from("payment_settings").select("card_number, card_owner_name").eq("id", 1).maybeSingle();
    cardSet = Boolean(data?.card_number);
    if (cardSet) {
      const num = formatCardNumber(String(data!.card_number));
      checks.push({ title: "شماره کارت پرداخت", ok: true, message: `${num.slice(0, 4)} •••• •••• ${num.slice(-4)} — ${String(data!.card_owner_name ?? "")}` });
    } else {
      checks.push({
        title: "شماره کارت پرداخت",
        ok: false,
        message: "هنوز شماره کارتی ثبت نشده.",
        todo: "داخل گروه این پیام را بفرست (به‌جای اعداد و نام، کارت اسما را بنویس):<br><code>/card 6037997112345674 اسما رضایی</code>",
      });
    }
  } catch {
    checks.push({ title: "شماره کارت پرداخت", ok: false, message: "خواندن اطلاعات کارت ممکن نشد." });
  }

  // ۶) پیام تست
  let testNote = "";
  if (url.searchParams.get("test") === "1") {
    if (chatId && botOk) {
      try {
        await sendMessage(chatId, "🧪 پیام تست: ربات استعلام قیمت آماده است ✅");
        testNote = `<div class="card ok"><div class="row"><div class="ico">📨</div><div><div class="t">پیام تست فرستاده شد</div><div class="m">داخل گروه بله را نگاه کن.</div></div></div></div>`;
      } catch (e) {
        testNote = `<div class="card bad"><div class="row"><div class="ico">⚠️</div><div><div class="t">پیام تست نرفت</div><div class="m">${esc(e instanceof Error ? e.message : "خطا")}</div><div class="todo">مطمئن شو ربات داخل گروه عضو است.</div></div></div></div>`;
      }
    } else {
      testNote = `<div class="card bad"><div class="row"><div class="ico">⚠️</div><div><div class="t">اول گروه را ثبت کن</div></div></div></div>`;
    }
  }

  const allOk = checks.every((c) => c.ok);
  const cards = checks
    .map(
      (c) => `<div class="card ${c.ok ? "ok" : "bad"}"><div class="row"><div class="ico">${c.ok ? "✅" : "❌"}</div><div>
        <div class="t">${esc(c.title)}</div><div class="m">${esc(c.message)}</div>${c.todo ? `<div class="todo">${c.todo}</div>` : ""}
      </div></div></div>`
    )
    .join("");

  return page(`
    <h1>راه‌اندازی ربات استعلام قیمت</h1>
    <p class="sub">هر مورد باید سبز (✅) شود.</p>
    ${cards}
    ${testNote}
    <div class="card final ${allOk ? "ok" : ""}">${allOk ? "🎉 همه‌چیز آماده است!" : "موارد قرمز را انجام بده و دوباره صفحه را باز کن."}</div>
    <div class="btns">
      <a class="btn" href="${esc(base)}">🔄 بررسی دوباره</a>
      <a class="btn alt" href="${esc(base)}&amp;test=1">📨 فرستادن پیام تست به گروه</a>
    </div>
  `);
}
