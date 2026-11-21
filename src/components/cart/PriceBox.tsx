// مسیر فایل: src/components/cart/PriceBox.tsx
// بخش قیمت هر محصول در سبد خرید: قیمت امروز، در حال استعلام، قیمت نهایی، یا اعتبار تمام‌شده.
"use client";

import { Loader2, CheckCircle2, MessageCircleQuestion, TrendingUp, TrendingDown, RefreshCw, CalendarCheck } from "lucide-react";
import { formatNumber } from "@/lib/price-utils";
import { formatFaDate } from "@/lib/fa-date";
import type { ItemState } from "@/lib/useInquiries";

interface Props {
  state: ItemState;
  /** قیمت امروز سایت (برای محصولی که هنوز استعلام نشده) */
  currentPrice: number;
  busy: boolean;
  storeOpen: boolean;
  onAsk: () => void;
}

const Toman = ({ value, big = false }: { value: number; big?: boolean }) => (
  <span className={big ? "text-2xl font-bold text-text-dark" : "font-bold"}>
    {formatNumber(value)} <span className="text-sm font-normal text-gray-500">تومان</span>
  </span>
);

const askButtonClass =
  "inline-flex items-center justify-center gap-2 min-h-12 px-5 rounded-2xl border-2 border-primary-pink text-primary-pink font-bold hover:bg-primary-pink hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export default function PriceBox({ state, currentPrice, busy, storeOpen, onAsk }: Props) {
  if (state.kind === "waiting") {
    return (
      <div role="status" aria-live="polite" className="w-full bg-soft-blue/30 border border-soft-blue rounded-2xl p-4 flex items-center gap-3">
        <Loader2 className="w-7 h-7 text-primary-pink animate-spin shrink-0" aria-hidden="true" />
        <div className="text-right">
          <p className="font-bold text-text-dark">در حال پرسیدن قیمت از هنرمند…</p>
          <p className="text-sm text-gray-500">
            {state.stage === "queued"
              ? state.queueAhead > 0
                ? `${formatNumber(state.queueAhead)} درخواست قبل از شما در صف است`
                : "به‌زودی نوبت شما می‌شود"
              : "هنرمند در حال بررسی قیمت است"}
          </p>
        </div>
      </div>
    );
  }

  if (state.kind === "answered") {
    const diff = state.final - state.previous;
    // تاریخ آخرین به‌روزرسانی قیمت (قیمتِ تأییدشده تا ۷ روز برای همه‌ی مشتری‌ها معتبر است)
    const updatedOn = state.confirmedAt ? formatFaDate(state.confirmedAt) : "";
    const validUntil = formatFaDate(state.lockedUntil);
    const dateNote = updatedOn ? (
      <div className="mt-3 pt-3 border-t border-black/5 text-sm leading-relaxed text-text-dark/80">
        <p className="flex items-start gap-1.5">
          <CalendarCheck className="w-4 h-4 mt-0.5 shrink-0 text-green-600" aria-hidden="true" />
          <span>
            قیمت این محصول در تاریخ <strong>{updatedOn}</strong> به‌روزرسانی شده است؛ می‌توانید با خیال راحت خرید کنید.
          </span>
        </p>
        {validUntil && <p className="mt-1 text-gray-500">اعتبار این قیمت تا {validUntil}</p>}
      </div>
    ) : null;
    if (diff === 0) {
      return (
        <div role="status" aria-live="polite" className="w-full bg-mint-green border border-green-200 rounded-2xl p-4">
          <p className="flex items-center gap-2 font-bold text-text-dark">
            <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" aria-hidden="true" />
            قیمت تغییری نکرده؛ همان قبلی است
          </p>
          <p className="mt-1">
            <Toman value={state.final} big />
          </p>
          {dateNote}
        </div>
      );
    }
    const up = diff > 0;
    return (
      <div
        role="status"
        aria-live="polite"
        className={`w-full rounded-2xl p-4 border ${up ? "bg-amber-50 border-amber-200" : "bg-mint-green border-green-200"}`}
      >
        <p className="flex items-center gap-2 font-bold text-text-dark">
          {up ? (
            <TrendingUp className="w-6 h-6 text-amber-600 shrink-0" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-6 h-6 text-green-600 shrink-0" aria-hidden="true" />
          )}
          قیمت امروز {up ? "بیشتر شد" : "کمتر شد"}
        </p>
        <div className="flex items-baseline gap-3 flex-wrap mt-1">
          <Toman value={state.final} big />
          <span className="text-gray-400 line-through">{formatNumber(state.previous)}</span>
        </div>
        <p className={`text-sm font-bold mt-1 ${up ? "text-amber-700" : "text-green-700"}`}>
          {formatNumber(Math.abs(diff))} تومان {up ? "بیشتر از قبل" : "ارزان‌تر از قبل"}
        </p>
        {dateNote}
      </div>
    );
  }

  if (state.kind === "expired") {
    return (
      <div role="status" className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="flex items-center gap-2 font-bold text-text-dark">
          <RefreshCw className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />
          اعتبار قیمت تمام شد
        </p>
        <p className="text-sm text-gray-500 mt-1 mb-3">برای دیدن قیمت تازه، دوباره بپرس.</p>
        <button type="button" onClick={onAsk} disabled={busy || !storeOpen} className={askButtonClass}>
          <MessageCircleQuestion className="w-5 h-5" aria-hidden="true" />
          دوباره استعلام بگیر
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="text-primary-pink font-bold text-xl">
        {formatNumber(currentPrice)} <span className="text-sm font-normal text-gray-400">تومان</span>
      </div>
      <button type="button" onClick={onAsk} disabled={busy || !storeOpen} className={askButtonClass}>
        <MessageCircleQuestion className="w-5 h-5" aria-hidden="true" />
        استعلام قیمت امروز
      </button>
    </div>
  );
}
