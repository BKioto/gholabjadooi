// مسیر فایل: src/store/inquiryStore.ts
// حافظه‌ی «استعلام قیمت» در مرورگر مشتری (کنار سبد خرید ذخیره می‌شود).

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CustomerInquiry {
  id: number;
  productId: string;
  status: "waiting" | "answered" | "cancelled" | "expired";
  stage: "queued" | "asking" | "answered" | "cancelled" | "expired";
  previousPrice: number;
  finalPrice: number | null;
  answeredAt: string | null;
  lockedUntil: string | null;
  lockExpired: boolean;
  queueAhead: number;
  createdAt: string;
  batchIndex: number;
  batchTotal: number;
}

interface InquiryState {
  /** شناسه‌ی تصادفی این سبد خرید (در لینک ذخیره‌شده هم می‌آید) */
  token: string | null;
  /** مشتری گفته: «با تغییر قیمت مشکلی ندارم» */
  acceptFluctuation: boolean;
  /** آخرین وضعیت استعلام هر محصول (کلید = شناسه‌ی محصول) */
  inquiries: Record<string, CustomerInquiry>;
  /** اختلاف ساعت سرور و گوشی مشتری (میلی‌ثانیه) */
  serverOffsetMs: number;
  ensureToken: () => string;
  adoptToken: (token: string) => void;
  setAcceptFluctuation: (value: boolean) => void;
  mergeInquiries: (list: CustomerInquiry[]) => void;
  replaceInquiries: (list: CustomerInquiry[], serverTime?: string) => void;
  reset: () => void;
}

export function makeUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const toMap = (list: CustomerInquiry[]): Record<string, CustomerInquiry> =>
  list.reduce<Record<string, CustomerInquiry>>((acc, i) => {
    acc[i.productId] = i;
    return acc;
  }, {});

export const useInquiryStore = create<InquiryState>()(
  persist(
    (set, get) => ({
      token: null,
      acceptFluctuation: false,
      inquiries: {},
      serverOffsetMs: 0,

      ensureToken: () => {
        const existing = get().token;
        if (existing) return existing;
        const token = makeUuid();
        set({ token });
        return token;
      },

      adoptToken: (token) => set({ token }),

      setAcceptFluctuation: (value) => set({ acceptFluctuation: value }),

      mergeInquiries: (list) => set({ inquiries: { ...get().inquiries, ...toMap(list) } }),

      replaceInquiries: (list, serverTime) => {
        const offset = serverTime ? Date.parse(serverTime) - Date.now() : get().serverOffsetMs;
        set({ inquiries: toMap(list), serverOffsetMs: Number.isFinite(offset) ? offset : 0 });
      },

      reset: () => set({ token: null, acceptFluctuation: false, inquiries: {}, serverOffsetMs: 0 }),
    }),
    { name: "gholabjadooi-inquiry-storage" }
  )
);
