// مسیر فایل: src/lib/server/inquiry-bot.ts
// مغز سیستم «استعلام قیمت لحظه‌ای»: صف، پیام‌های ربات، دکمه‌های اسما، دستورها و اعلان سفارش.
// قوانین اصلی (یکی‌یکی بودن صف، قفل قیمت، ثبت قیمت) داخل دیتابیس اجرا می‌شود؛ این فایل فقط پیام‌ها را می‌فرستد.

import { getAdminClient, rpc } from "./supabase-admin";
import {
  answerCallback,
  editMessage,
  sendMessage,
  sendPhotoOrText,
  type BaleCallbackQuery,
  type BaleMessage,
  type BaleUpdate,
  type InlineKeyboard,
} from "./bale";
import {
  formatCardNumber,
  formatToman,
  isValidCardNumber,
  parseCardInput,
  parsePriceInput,
  toPersianDigits,
  tomanInWords,
} from "../price-utils";

// ---------------------------------------------------------------------------
// انواع داده
// ---------------------------------------------------------------------------
export interface InquiryRow {
  id: number;
  token: string;
  batch_id: number | null;
  batch_index: number;
  batch_total: number;
  product_id: string;
  product_title: string;
  product_image: string | null;
  cart_price: number;
  shown_price: number | null;
  proposed_price: number | null;
  final_price: number | null;
  status: string;
  chat_id: string | null;
  message_id: number | null;
  message_kind: "photo" | "text" | null;
  prompt_message_id: number | null;
}

interface ApplyResult {
  ok: boolean;
  reason?: string;
  inquiry?: InquiryRow;
  oldPrice?: number;
  newPrice?: number;
  changed?: boolean;
}

export interface BotSettings {
  chat_id: string | null;
  setup_code: string;
  pending_card: { number: string; owner: string } | null;
}

export interface OrderNotice {
  orderCode: string;
  total: number;
  packaging: number;
  priceMode: string | null;
  name: string;
  phone: string;
  lines: { title: string; color?: string | null; quantity: number; unitPrice: number; state: string }[];
}

// ---------------------------------------------------------------------------
// ابزارهای کوچک
// ---------------------------------------------------------------------------
async function safe<T>(fn: () => Promise<T>, label = "bale"): Promise<T | null> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[price-inquiry] ${label}:`, e instanceof Error ? e.message : e);
    return null;
  }
}

/** پیام را ویرایش می‌کند؛ اگر نشد، همان متن را به‌صورت پیام تازه می‌فرستد تا اسما همیشه نتیجه را ببیند. */
async function editOrNotify(
  chatId: string,
  messageId: number,
  kind: "photo" | "text",
  text: string
): Promise<void> {
  const edited = await safe(() => editMessage(chatId, messageId, kind, text, []), "edit");
  if (edited === null) await safe(() => sendMessage(chatId, text, { replyTo: messageId }), "notify");
}

export async function getBotSettings(): Promise<BotSettings> {
  const { data, error } = await getAdminClient()
    .from("bale_settings")
    .select("chat_id, setup_code, pending_card")
    .eq("id", 1)
    .single();
  if (error || !data) throw new Error(`bale_settings: ${error?.message ?? "not found"}`);
  return data as BotSettings;
}

async function queuedCount(): Promise<number> {
  const { count } = await getAdminClient()
    .from("price_inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "queued");
  return count ?? 0;
}

const diffText = (from: number, to: number): string => {
  const d = to - from;
  if (d === 0) return "بدون تغییر";
  return `${formatToman(Math.abs(d))} ${d > 0 ? "بیشتر" : "کمتر"}`;
};

// ---------------------------------------------------------------------------
// متن پیام‌ها و دکمه‌ها
// ---------------------------------------------------------------------------
function inquiryText(row: InquiryRow, remaining?: number): string {
  const price = Number(row.shown_price ?? row.cart_price);
  const lines = [
    "🧶 استعلام قیمت",
    "",
    `📦 ${row.product_title}`,
    `💰 قیمت فعلی در سایت: ${formatToman(price)}`,
    `(${tomanInWords(price)})`,
    "",
  ];
  const who = row.batch_id ? `🧾 درخواست شماره ${toPersianDigits(row.batch_id)}` : "";
  if (row.batch_total > 1) {
    lines.push(`${who} — محصول ${toPersianDigits(row.batch_index)} از ${toPersianDigits(row.batch_total)}`);
  } else if (who) {
    lines.push(who);
  }
  if (remaining && remaining > 0) lines.push(`⏳ ${toPersianDigits(remaining)} مورد دیگر در صف است`);
  lines.push(
    "",
    "✅ اگر قیمت درست است، دکمه «قیمت درسته» را بزن.",
    "✏️ اگر قیمت باید عوض شود، دکمه «قیمت جدید» را بزن."
  );
  return lines.join("\n");
}

const editPromptText = (row: InquiryRow, remaining: number): string =>
  `${inquiryText(row, remaining)}\n\n✏️ منتظر قیمت جدید هستم.\nعدد را بنویس (مثلاً ۲٬۶۰۰٬۰۰۰ یا ۲.۶۰۰) و روی همین پیام «ریپلای» کن.`;

function confirmText(row: InquiryRow, price: number): string {
  const before = Number(row.shown_price ?? row.cart_price);
  return [
    `❓ مطمئنی قیمت ${formatToman(price)} درسته؟`,
    `(${tomanInWords(price)})`,
    "",
    `📦 ${row.product_title}`,
    `قیمت قبلی: ${formatToman(before)} — ${diffText(before, price)}`,
    "",
    "محصول با این قیمت به‌روزرسانی بشه؟",
  ].join("\n");
}

function resultText(row: InquiryRow, oldPrice: number, newPrice: number, changed: boolean): string {
  return [
    "✅ ثبت شد",
    `📦 ${row.product_title}`,
    `💰 قیمت نهایی: ${formatToman(newPrice)}`,
    `(${tomanInWords(newPrice)})`,
    changed ? `🔄 قبلاً: ${formatToman(oldPrice)} — ${diffText(oldPrice, newPrice)}` : "👌 قیمت تغییری نکرد",
  ].join("\n");
}

const mainKeyboard = (id: number): InlineKeyboard => [
  [{ text: "✅ قیمت درسته", callback_data: `ok:${id}` }],
  [{ text: "✏️ قیمت جدید", callback_data: `edit:${id}` }],
];

const HELP_TEXT = [
  "سلام 👋 من ربات استعلام قیمت «قلاب جادویی» هستم.",
  "",
  "دستورها:",
  "/register کد — ثبت این گروه برای استعلام‌ها",
  "/card شماره‌کارت نام‌صاحب‌کارت — ثبت یا تغییر کارت پرداخت",
  "/queue — دیدن وضعیت صف",
].join("\n");

// ---------------------------------------------------------------------------
// ارسال استعلام بعدیِ صف به گروه
// ---------------------------------------------------------------------------
export async function dispatchNext(depth = 0): Promise<void> {
  if (depth > 5) return;
  const settings = await getBotSettings();
  if (!settings.chat_id) return; // گروه هنوز ثبت نشده؛ استعلام‌ها در صف می‌مانند

  const row = await rpc<(InquiryRow & { queueRemaining: number }) | null>("dispatch_next_inquiry");
  if (!row) return;

  try {
    const sent = await sendPhotoOrText(
      settings.chat_id,
      row.product_image,
      inquiryText(row, row.queueRemaining),
      mainKeyboard(row.id)
    );
    const ok = await rpc<boolean>("mark_inquiry_sent", {
      p_id: row.id,
      p_chat_id: settings.chat_id,
      p_message_id: sent.messageId,
      p_kind: sent.kind,
    });
    if (!ok) {
      // مشتری درست در همین لحظه استعلام را لغو کرده بود
      await editOrNotify(settings.chat_id, sent.messageId, sent.kind, "🚫 مشتری این محصول را از سبد حذف کرد؛ نیازی به جواب نیست.");
      await dispatchNext(depth + 1);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[price-inquiry] dispatch failed:", message);
    await safe(() => rpc("release_inquiry_send", { p_id: row.id, p_error: message }), "release");
  }
}

// ---------------------------------------------------------------------------
// نگهداری صف: یادآوری، انقضا، ارسال دوباره
// ---------------------------------------------------------------------------
let lastMaintenance = 0;

export async function runMaintenance(): Promise<void> {
  const settings = await getBotSettings();
  const res = await rpc<{ expired: InquiryRow[]; reminders: InquiryRow[] }>("inquiry_maintenance");
  if (settings.chat_id) {
    for (const r of res.expired) {
      if (r.message_id && r.chat_id) {
        await editOrNotify(r.chat_id, r.message_id, r.message_kind ?? "text", `⌛ این استعلام بدون جواب منقضی شد.\n📦 ${r.product_title}`);
      }
    }
    for (const r of res.reminders) {
      await safe(() =>
        sendMessage(
          settings.chat_id!,
          `⏰ یادآوری: هنوز منتظر قیمت «${r.product_title}» هستیم.\nدکمه‌های همان پیام را بزن.`,
          { replyTo: r.message_id ?? undefined }
        )
      );
    }
  }
  await dispatchNext();
}

/** حداکثر هر ۲۰ ثانیه یک‌بار اجرا می‌شود (چون هر مشتری مدام وضعیت را می‌پرسد). */
export async function runMaintenanceThrottled(minGapMs = 20_000): Promise<void> {
  const now = Date.now();
  if (now - lastMaintenance < minGapMs) return;
  lastMaintenance = now;
  await runMaintenance();
}

/** وقتی مشتری استعلام را لغو کرد: پیام گروه را اصلاح کن و نفر بعدی را بفرست. */
export async function afterCustomerCancel(rows: InquiryRow[]): Promise<void> {
  for (const r of rows) {
    if (r.message_id && r.chat_id) {
      await editOrNotify(
        r.chat_id,
        r.message_id,
        r.message_kind ?? "text",
        `🚫 مشتری این محصول را از سبد حذف کرد؛ نیازی به جواب نیست.\n📦 ${r.product_title}`
      );
      if (r.prompt_message_id) {
        await safe(() => editMessage(r.chat_id!, r.prompt_message_id!, "text", "🚫 لغو شد.", []));
      }
    }
  }
  await dispatchNext();
}

// ---------------------------------------------------------------------------
// اعلان سفارش جدید
// ---------------------------------------------------------------------------
export async function notifyNewOrder(o: OrderNotice): Promise<void> {
  const settings = await getBotSettings();
  if (!settings.chat_id) return;
  const L: string[] = [`🛒 سفارش جدید — ${o.orderCode}`, "", `👤 ${o.name}`, `📞 ${o.phone}`, "", "🧶 محصولات:"];
  for (const l of o.lines) {
    const flag = l.state === "confirmed" ? "✅" : "⚠️";
    L.push(`${flag} ${l.title}${l.color ? ` (${l.color})` : ""} × ${toPersianDigits(l.quantity)} — ${formatToman(l.unitPrice)}`);
  }
  L.push("", `💰 مبلغ کل (با ${formatToman(o.packaging)} بسته‌بندی): ${formatToman(o.total)}`, "");
  if (o.priceMode === "confirmed") {
    L.push("✅ قیمت همه‌ی محصولات استعلام و تأیید شده است.");
  } else {
    L.push(
      "⚠️ مشتری قبول کرده که قیمت ممکن است تغییر کرده باشد.",
      "(✅ استعلام‌شده، ⚠️ استعلام‌نشده)",
      "اگر قیمت روز بالاتر است، شماره کارت را برایش بفرست و فقط مابه‌التفاوت را بگیر."
    );
  }
  L.push("", "💳 مشتری اعلام کرده مبلغ را واریز کرده؛ موجودی کارت را چک کن.");
  await sendMessage(settings.chat_id, L.join("\n"));
}

// ---------------------------------------------------------------------------
// پردازش پیام‌های ورودی از بله (وب‌هوک)
// ---------------------------------------------------------------------------
export async function handleUpdate(update: BaleUpdate): Promise<void> {
  const fresh = await rpc<boolean>("claim_bale_update", { p_update_id: update.update_id });
  if (!fresh) return; // پیام تکراری
  if (update.callback_query) {
    await handleCallback(update.callback_query);
    return;
  }
  if (update.message) {
    await handleMessage(update.message);
  }
}

function explainFailure(res: ApplyResult): string {
  switch (res.reason) {
    case "stale":
      return "این پیام قدیمی است؛ قیمت جدیدی فرستاده شده.";
    case "not_active":
    case "not_found":
      return "این استعلام دیگر فعال نیست.";
    case "bad_price":
      return "این عدد قابل قبول نیست.";
    default:
      return "این کار الان ممکن نیست.";
  }
}

async function finishInquiry(res: ApplyResult): Promise<void> {
  const row = res.inquiry!;
  if (row.chat_id && row.message_id) {
    await editOrNotify(
      row.chat_id,
      row.message_id,
      row.message_kind ?? "text",
      resultText(row, Number(res.oldPrice), Number(res.newPrice), Boolean(res.changed))
    );
  }
  if (row.chat_id && row.prompt_message_id) {
    await safe(() => editMessage(row.chat_id!, row.prompt_message_id!, "text", "✅ ثبت شد.", []));
  }
  await dispatchNext();
}

async function handleCallback(cb: BaleCallbackQuery): Promise<void> {
  const settings = await getBotSettings();
  // اگر بله مشخصات چت را همراه دکمه نفرستاد، گروه ثبت‌شده را فرض می‌کنیم (خودِ استعلام در دیتابیس محافظ است)
  const knownChat = cb.message?.chat?.id != null ? String(cb.message.chat.id) : null;
  const chatId = knownChat ?? settings.chat_id ?? "";
  if (!settings.chat_id || chatId !== settings.chat_id) {
    await safe(() => answerCallback(cb.id, "این چت برای استعلام قیمت ثبت نشده است."));
    return;
  }
  const cbMessageId = cb.message?.message_id ?? null;

  const [action, idStr, extra] = String(cb.data ?? "").split(":");
  const reply = (text: string) => safe(() => answerCallback(cb.id, text), "answer");

  // --- تأیید کارت ---
  if (action === "cardyes" || action === "cardno") {
    const pending = settings.pending_card;
    const admin = getAdminClient();
    if (action === "cardyes" && pending) {
      await admin
        .from("payment_settings")
        .upsert({ id: 1, card_number: pending.number, card_owner_name: pending.owner, updated_at: new Date().toISOString() });
      await admin.from("bale_settings").update({ pending_card: null, updated_at: new Date().toISOString() }).eq("id", 1);
      await reply("✅ ثبت شد");
      const text = `✅ کارت ثبت شد.\n💳 ${formatCardNumber(pending.number)}\n👤 ${pending.owner}`;
      if (cbMessageId) await editOrNotify(chatId, cbMessageId, "text", text);
      else await safe(() => sendMessage(chatId, text));
    } else {
      await admin.from("bale_settings").update({ pending_card: null, updated_at: new Date().toISOString() }).eq("id", 1);
      await reply("لغو شد");
      if (cbMessageId) await safe(() => editMessage(chatId, cbMessageId, "text", "❌ لغو شد.", []));
    }
    return;
  }

  const id = Number(idStr);
  if (!Number.isInteger(id) || id <= 0) {
    await reply("دکمه نامعتبر است.");
    return;
  }

  if (action === "ok") {
    const res = await rpc<ApplyResult>("inquiry_apply", { p_id: id, p_action: "confirm_same" });
    if (!res.ok) return void (await reply(explainFailure(res)));
    await reply("✅ ثبت شد");
    await finishInquiry(res);
    return;
  }

  if (action === "edit") {
    const res = await rpc<ApplyResult>("inquiry_apply", { p_id: id, p_action: "request_edit" });
    if (!res.ok) return void (await reply(explainFailure(res)));
    await reply("✏️ قیمت جدید را بنویس");
    const row = res.inquiry!;
    const remaining = await queuedCount();
    const edited = await safe(() =>
      editMessage(row.chat_id!, row.message_id!, row.message_kind ?? "text", editPromptText(row, remaining), [
        [{ text: "↩️ برگشت", callback_data: `back:${row.id}` }],
      ])
    );
    if (edited === null) {
      await safe(() =>
        sendMessage(chatId, "✏️ قیمت جدید را بنویس (مثلاً ۲٬۶۰۰٬۰۰۰ یا ۲.۶۰۰) و روی پیام استعلام «ریپلای» کن.", {
          replyTo: row.message_id ?? undefined,
        })
      );
    }
    return;
  }

  if (action === "back") {
    const res = await rpc<ApplyResult>("inquiry_apply", { p_id: id, p_action: "back" });
    if (!res.ok) return void (await reply(explainFailure(res)));
    await reply("↩️ برگشتیم");
    const row = res.inquiry!;
    const remaining = await queuedCount();
    await safe(() => editMessage(row.chat_id!, row.message_id!, row.message_kind ?? "text", inquiryText(row, remaining), mainKeyboard(row.id)));
    if (row.prompt_message_id) {
      await safe(() => editMessage(row.chat_id!, row.prompt_message_id!, "text", "↩️ لغو شد.", []));
    }
    return;
  }

  if (action === "yes") {
    const price = Number(extra);
    const res = await rpc<ApplyResult>("inquiry_apply", { p_id: id, p_action: "accept", p_price: price });
    if (!res.ok) return void (await reply(explainFailure(res)));
    await reply("✅ قیمت به‌روزرسانی شد");
    await finishInquiry(res);
    return;
  }

  if (action === "no") {
    const res = await rpc<ApplyResult>("inquiry_apply", { p_id: id, p_action: "reject" });
    if (!res.ok) return void (await reply(explainFailure(res)));
    await reply("باشه، دوباره بنویس");
    if (cbMessageId) {
      await safe(() => editMessage(chatId, cbMessageId, "text", "❌ لغو شد. قیمت جدید را دوباره بنویس (روی پیام استعلام ریپلای کن).", []));
    }
    return;
  }

  await reply("دکمه نامعتبر است.");
}

async function handleMessage(msg: BaleMessage): Promise<void> {
  const text = String(msg.text ?? "").trim();
  if (!text) return;
  const chatId = String(msg.chat.id);
  const settings = await getBotSettings();

  const cmd = text.match(/^\/([A-Za-z_]+)(?:@\w+)?(?:\s+([\s\S]*))?$/);
  if (cmd) {
    const name = cmd[1].toLowerCase();
    const arg = (cmd[2] ?? "").trim();

    if (name === "start" || name === "help") {
      await safe(() => sendMessage(chatId, HELP_TEXT));
      return;
    }
    if (name === "register") {
      await cmdRegister(chatId, arg, settings);
      return;
    }
    if (settings.chat_id !== chatId) return; // بقیه‌ی دستورها فقط در گروه ثبت‌شده
    if (name === "card") {
      await cmdCard(chatId, arg);
      return;
    }
    if (name === "queue") {
      await cmdQueue(chatId);
      return;
    }
    return;
  }

  if (settings.chat_id !== chatId) return;
  await handlePriceText(msg, text, chatId);
}

async function cmdRegister(chatId: string, arg: string, settings: BotSettings): Promise<void> {
  if (!arg) {
    await safe(() => sendMessage(chatId, "برای ثبت این گروه بنویس:\n/register کد"));
    return;
  }
  if (arg.toLowerCase() !== String(settings.setup_code).toLowerCase()) {
    await safe(() => sendMessage(chatId, "❌ کد درست نیست."));
    return;
  }
  await getAdminClient()
    .from("bale_settings")
    .update({ chat_id: chatId, registered_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", 1);
  await safe(() =>
    sendMessage(
      chatId,
      [
        "✅ این گروه به‌عنوان «گروه استعلام قیمت» ثبت شد.",
        "از حالا استعلام‌ها و سفارش‌های جدید همین‌جا می‌آید.",
        "",
        "برای ثبت شماره کارت پرداخت بنویس:",
        "/card شماره‌کارت نام‌صاحب‌کارت",
      ].join("\n")
    )
  );
  await dispatchNext();
}

async function cmdCard(chatId: string, arg: string): Promise<void> {
  if (!arg) {
    const { data } = await getAdminClient().from("payment_settings").select("card_number, card_owner_name").eq("id", 1).single();
    const current = data?.card_number
      ? `💳 کارت فعلی: ${formatCardNumber(String(data.card_number))}\n👤 ${data.card_owner_name ?? ""}\n\n`
      : "هنوز کارتی ثبت نشده است.\n\n";
    await safe(() => sendMessage(chatId, `${current}برای ثبت یا تغییر کارت بنویس:\n/card 6037997112345674 اسما رضایی`));
    return;
  }
  const parsed = parseCardInput(arg);
  if (!parsed || !isValidCardNumber(parsed.number)) {
    await safe(() =>
      sendMessage(chatId, "❌ شماره کارت درست نیست (۱۶ رقم لازم است).\nمثال:\n/card 6037997112345674 اسما رضایی")
    );
    return;
  }
  if (!parsed.owner) {
    await safe(() => sendMessage(chatId, "❌ نام صاحب کارت را هم بنویس.\nمثال:\n/card 6037997112345674 اسما رضایی"));
    return;
  }
  await getAdminClient()
    .from("bale_settings")
    .update({ pending_card: { number: parsed.number, owner: parsed.owner.slice(0, 80) }, updated_at: new Date().toISOString() })
    .eq("id", 1);
  await safe(() =>
    sendMessage(
      chatId,
      [
        `💳 شماره کارت: ${formatCardNumber(parsed.number)}`,
        `👤 به نام: ${parsed.owner.slice(0, 80)}`,
        "",
        "این اطلاعات در صفحه‌ی پرداخت سایت به مشتری نشان داده می‌شود. درسته؟",
      ].join("\n"),
      {
        keyboard: [
          [
            { text: "✅ بله، ثبت کن", callback_data: "cardyes" },
            { text: "❌ نه", callback_data: "cardno" },
          ],
        ],
      }
    )
  );
}

async function cmdQueue(chatId: string): Promise<void> {
  const admin = getAdminClient();
  const waiting = await queuedCount();
  const { data: active } = await admin
    .from("price_inquiries")
    .select("product_title")
    .in("status", ["sent", "awaiting_price", "awaiting_confirm"])
    .order("id")
    .limit(1)
    .maybeSingle();
  const lines = [
    active ? `🟢 الان منتظر جواب: «${active.product_title}»` : "🟢 الان هیچ استعلام بازی نیست.",
    `⏳ در صف: ${toPersianDigits(waiting)} مورد`,
  ];
  await safe(() => sendMessage(chatId, lines.join("\n")));
}

/** اسما عدد را (به‌صورت ریپلای یا معمولی) می‌نویسد. */
async function handlePriceText(msg: BaleMessage, text: string, chatId: string): Promise<void> {
  const admin = getAdminClient();
  const { data: active } = await admin
    .from("price_inquiries")
    .select("*")
    .in("status", ["sent", "awaiting_price", "awaiting_confirm"])
    .order("id")
    .limit(1)
    .maybeSingle();
  if (!active) return; // چیزی منتظر قیمت نیست؛ گفتگوی عادی گروه
  const row = active as InquiryRow;

  const replyId = msg.reply_to_message?.message_id;
  if (replyId && replyId !== row.message_id && replyId !== row.prompt_message_id) return; // جواب به پیام دیگری است

  const parsed = parsePriceInput(text, Number(row.shown_price ?? row.cart_price));
  if (!parsed.ok) {
    if (replyId && parsed.reason === "out_of_range") {
      await safe(() => sendMessage(chatId, "⚠️ این عدد خارج از محدوده است. قیمت را به تومان بنویس (مثلاً ۲٬۶۰۰٬۰۰۰).", { replyTo: msg.message_id }));
    } else if (replyId && parsed.reason === "rial") {
      await safe(() => sendMessage(chatId, "⚠️ قیمت را به «تومان» بنویس، نه ریال.", { replyTo: msg.message_id }));
    }
    return; // «سلام» و مانند آن: نادیده
  }

  const res = await rpc<ApplyResult>("inquiry_apply", { p_id: row.id, p_action: "propose", p_price: parsed.value, p_prompt_message_id: null });
  if (!res.ok) return;

  const oldPrompt = row.prompt_message_id;
  const sent = await safe(() =>
    sendMessage(chatId, confirmText(row, parsed.value), {
      replyTo: msg.message_id,
      keyboard: [
        [
          { text: "✅ بله، به‌روزرسانی کن", callback_data: `yes:${row.id}:${parsed.value}` },
          { text: "❌ نه، دوباره می‌نویسم", callback_data: `no:${row.id}` },
        ],
      ],
    })
  );
  if (sent) {
    await admin.from("price_inquiries").update({ prompt_message_id: sent.message_id }).eq("id", row.id);
    if (oldPrompt && oldPrompt !== sent.message_id) {
      await safe(() => editMessage(chatId, oldPrompt, "text", "↩️ این پیشنهاد با عدد جدید جایگزین شد.", []));
    }
  }
}

