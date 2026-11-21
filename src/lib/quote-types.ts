// مسیر فایل: src/lib/quote-types.ts
// شکل پاسخ سرور برای قیمت‌گذاری سبد خرید.

export interface QuoteLine {
  productId: string;
  title: string;
  image: string;
  color: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  state: "confirmed" | "fluctuation" | "needs_inquiry" | "unavailable";
  inquiryId: number | null;
  lockedUntil: string | null;
  /** تاریخی که قیمت این محصول آخرین بار تأیید/به‌روز شده (اعتبار ۷ روزه برای همه‌ی مشتری‌ها) */
  confirmedAt: string | null;
}

export interface Quote {
  ok: boolean;
  reason?: string;
  storeOpen: boolean;
  canOrder: boolean;
  reasons: string[];
  priceMode: "confirmed" | "fluctuation" | "mixed" | null;
  lines: QuoteLine[];
  subtotal: number;
  packaging: number;
  total: number;
  lockedUntil: string | null;
  serverTime: string;
  payment?: { cardNumber: string; cardOwnerName: string } | null;
}
