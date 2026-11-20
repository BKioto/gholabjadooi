// مسیر فایل: src/lib/server/bale.ts
// ارتباط با ربات بله (Bale Bot API). فقط در سرور استفاده می‌شود.

const API = process.env.BALE_API_BASE || "https://tapi.bale.ai";

export class BaleError extends Error {
  constructor(message: string, public method: string, public code?: number) {
    super(`[bale:${method}] ${message}`);
  }
}

export type InlineKeyboard = { text: string; callback_data: string }[][];

export interface BaleUser {
  id: number | string;
  first_name?: string;
  username?: string;
}
export interface BaleChat {
  id: number | string;
  type?: string;
  title?: string;
}
export interface BaleMessage {
  message_id: number;
  chat: BaleChat;
  from?: BaleUser;
  text?: string;
  caption?: string;
  reply_to_message?: BaleMessage;
}
export interface BaleCallbackQuery {
  id: string;
  from?: BaleUser;
  message?: BaleMessage;
  data?: string;
}
export interface BaleUpdate {
  update_id: number;
  message?: BaleMessage;
  callback_query?: BaleCallbackQuery;
}

function token(): string {
  const t = process.env.BALE_BOT_TOKEN;
  if (!t) throw new BaleError("BALE_BOT_TOKEN تنظیم نشده است", "config");
  return t;
}

const toChat = (chatId: string | number): string | number =>
  typeof chatId === "string" && /^-?\d+$/.test(chatId) && Math.abs(Number(chatId)) < Number.MAX_SAFE_INTEGER
    ? Number(chatId)
    : chatId;

async function parse<T>(res: Response, method: string): Promise<T> {
  const data = (await res.json().catch(() => null)) as { ok?: boolean; result?: T; description?: string; error_code?: number } | null;
  if (!res.ok || !data?.ok) {
    throw new BaleError(data?.description || `HTTP ${res.status}`, method, data?.error_code ?? res.status);
  }
  return data.result as T;
}

async function callJson<T>(method: string, body: Record<string, unknown>, timeoutMs = 8000): Promise<T> {
  const res = await fetch(`${API}/bot${token()}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  return parse<T>(res, method);
}

async function callForm<T>(method: string, form: FormData, timeoutMs = 15000): Promise<T> {
  const res = await fetch(`${API}/bot${token()}/${method}`, {
    method: "POST",
    body: form,
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  return parse<T>(res, method);
}

export async function getMe(): Promise<{ id: number | string; first_name?: string; username?: string }> {
  return callJson("getMe", {});
}

export async function setWebhook(url: string): Promise<boolean> {
  await callJson("setWebhook", { url });
  return true;
}

export async function sendMessage(
  chatId: string | number,
  text: string,
  opts: { keyboard?: InlineKeyboard; replyTo?: number } = {}
): Promise<{ message_id: number }> {
  const body: Record<string, unknown> = { chat_id: toChat(chatId), text };
  if (opts.replyTo) body.reply_to_message_id = opts.replyTo;
  if (opts.keyboard) body.reply_markup = { inline_keyboard: opts.keyboard };
  return callJson("sendMessage", body);
}

const guessName = (url: string, mime: string): string => {
  const ext = /\.(jpe?g|png|webp|gif)(\?|$)/i.exec(url)?.[1]?.toLowerCase();
  if (ext) return `product.${ext === "jpeg" ? "jpg" : ext}`;
  if (mime.includes("png")) return "product.png";
  if (mime.includes("webp")) return "product.webp";
  return "product.jpg";
};

/** عکس + متن را می‌فرستد؛ اگر عکس نرفت، فقط متن (همراه لینک عکس). */
export async function sendPhotoOrText(
  chatId: string | number,
  imageUrl: string | null,
  caption: string,
  keyboard: InlineKeyboard
): Promise<{ messageId: number; kind: "photo" | "text" }> {
  const reply_markup = { inline_keyboard: keyboard };

  if (imageUrl && /^https?:\/\//i.test(imageUrl)) {
    // ۱) ارسال با لینک عکس
    try {
      const m = await callJson<{ message_id: number }>("sendPhoto", {
        chat_id: toChat(chatId),
        photo: imageUrl,
        caption,
        reply_markup,
      });
      return { messageId: m.message_id, kind: "photo" };
    } catch (e) {
      console.warn("[bale] sendPhoto by url failed:", e instanceof Error ? e.message : e);
    }
    // ۲) دانلود عکس و آپلود مستقیم
    try {
      const img = await fetch(imageUrl, { signal: AbortSignal.timeout(8000), cache: "no-store" });
      if (img.ok) {
        const blob = await img.blob();
        if (blob.size > 0 && blob.size < 8_000_000) {
          const form = new FormData();
          form.append("chat_id", String(chatId));
          form.append("caption", caption);
          form.append("reply_markup", JSON.stringify(reply_markup));
          form.append("photo", blob, guessName(imageUrl, blob.type));
          const m = await callForm<{ message_id: number }>("sendPhoto", form);
          return { messageId: m.message_id, kind: "photo" };
        }
      }
    } catch (e) {
      console.warn("[bale] sendPhoto upload failed:", e instanceof Error ? e.message : e);
    }
  }

  // ۳) فقط متن
  const text = imageUrl ? `${caption}\n\n🖼 عکس محصول: ${imageUrl}` : caption;
  const m = await sendMessage(chatId, text, { keyboard });
  return { messageId: m.message_id, kind: "text" };
}

/** متن (یا کپشن عکس) و دکمه‌های یک پیام را عوض می‌کند. keyboard خالی = حذف دکمه‌ها. */
export async function editMessage(
  chatId: string | number,
  messageId: number,
  kind: "photo" | "text",
  text: string,
  keyboard: InlineKeyboard
): Promise<void> {
  const method = kind === "photo" ? "editMessageCaption" : "editMessageText";
  const base: Record<string, unknown> = { chat_id: toChat(chatId), message_id: messageId };
  if (kind === "photo") base.caption = text;
  else base.text = text;
  try {
    await callJson(method, { ...base, reply_markup: { inline_keyboard: keyboard } });
  } catch (e) {
    if (keyboard.length > 0) throw e;
    // اگر سرور «دکمه‌ی خالی» را قبول نکرد، فقط متن را عوض می‌کنیم
    await callJson(method, base);
  }
}

export async function answerCallback(callbackId: string, text?: string): Promise<void> {
  await callJson("answerCallbackQuery", { callback_query_id: callbackId, text: text ?? "", show_alert: false });
}
