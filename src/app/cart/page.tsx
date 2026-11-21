// مسیر فایل: src/app/cart/page.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ShoppingBag,
  ShieldCheck,
  Image as ImageIcon,
  Palette,
  Info,
  Loader2,
  CheckCircle2,
  Lightbulb,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useCartStore, type CartItem } from "@/store/cartStore";
import { useInquiryStore } from "@/store/inquiryStore";
import {
  computeItemState,
  useInquiries,
  useResumeFromLink,
  useServerNow,
  type AskProblem,
  type ItemState,
} from "@/lib/useInquiries";
import { useCartQuote } from "@/lib/useCartQuote";
import { useIsClient } from "@/lib/useIsClient";
import { formatNumber } from "@/lib/price-utils";
import { formatFaDate } from "@/lib/fa-date";
import PriceBox from "@/components/cart/PriceBox";
import SaveForLater from "@/components/cart/SaveForLater";

const PACKAGING = 50000;

const PROBLEM_TEXT: Record<Exclude<AskProblem, null>, string> = {
  network: "اینترنت یا سرور در دسترس نیست. چند لحظه‌ی دیگر دوباره امتحان کن.",
  rate_limited: "چند درخواست پشت‌سرهم فرستاده شد. چند دقیقه‌ی دیگر دوباره امتحان کن.",
  store_closed: "فروشگاه فعلاً بسته است؛ استعلام قیمت ممکن نیست.",
  server: "مشکلی پیش آمد. لطفاً دوباره امتحان کن.",
};

export default function CartPage() {
  const router = useRouter();
  const mounted = useIsClient();
  const [leaving, setLeaving] = useState(false);

  const { items, removeFromCart, increaseQuantity, decreaseQuantity } = useCartStore();
  const acceptFluctuation = useInquiryStore((s) => s.acceptFluctuation);
  const setAcceptFluctuation = useInquiryStore((s) => s.setAcceptFluctuation);

  // اگر مشتری از روی لینک ذخیره‌شده آمده باشد، سبد و استعلام‌هایش برمی‌گردد
  useResumeFromLink(mounted);

  const now = useServerNow();

  const token = useInquiryStore((s) => s.token);
  const inquiries = useInquiryStore((s) => s.inquiries);
  const inquiryKey = Object.values(inquiries)
    .map((i) => `${i.id}:${i.status}`)
    .join(",");

  // قیمت به‌روز از سرور (قیمت داخل مرورگر ممکن است قدیمی باشد)
  // با هر بار «استعلام» این شمارنده بالا می‌رود تا قیمتِ تازه‌ی سرور دوباره گرفته شود
  const [quoteTick, setQuoteTick] = useState(0);
  const quote = useCartQuote(items, token, acceptFluctuation, `${inquiryKey}|${quoteTick}`);

  const quotePrice = useCallback(
    (productId: string): number | null => {
      const line = quote?.lines.find((l) => l.productId === productId);
      return line ? line.unitPrice : null;
    },
    [quote]
  );

  const priceOf = useCallback((item: CartItem): number => quotePrice(item.id) ?? item.price, [quotePrice]);

  const { busy, problem, storeOpen, hasWaiting, ask, cancel, clearProblem } = useInquiries(items, priceOf);

  // استعلام فقط برای «یک» محصول انجام می‌شود؛ بعد از آن قیمتِ تازه‌ی سرور دوباره گرفته می‌شود
  // (اگر قیمت همان محصول در این فاصله تأیید شده باشد، همان لحظه نشان داده می‌شود)
  const askOne = useCallback(
    async (productId: string) => {
      await ask([productId]);
      setQuoteTick((t) => t + 1);
    },
    [ask]
  );

  // وضعیت قیمت هر محصول:
  //  ۱) اگر قیمتش در ۷ روز اخیر (با استعلامِ هر مشتری) تأیید شده باشد، همان تأییدیه‌ی مشترک نشان داده می‌شود
  //  ۲) وگرنه از روی استعلامِ خودِ مشتری
  const stateOf = useCallback(
    (productId: string): ItemState => {
      const line = quote?.lines.find((l) => l.productId === productId);
      if (line && line.state === "confirmed" && line.confirmedAt && line.lockedUntil) {
        const own = computeItemState(inquiries[productId], now);
        const inCartPrice = items.find((i) => i.id === productId)?.price ?? line.unitPrice;
        return {
          kind: "answered",
          previous: own.kind === "answered" ? own.previous : inCartPrice,
          final: line.unitPrice,
          lockedUntil: line.lockedUntil,
          confirmedAt: line.confirmedAt,
        };
      }
      return computeItemState(inquiries[productId], now);
    },
    [quote, items, inquiries, now]
  );

  const unavailable = useMemo(
    () => new Set((quote?.lines ?? []).filter((l) => l.state === "unavailable").map((l) => l.productId)),
    [quote]
  );

  const productIds = useMemo(() => Array.from(new Set(items.map((i) => i.id))), [items]);
  const states = productIds.map((pid) => stateOf(pid));
  const answeredCount = states.filter((s) => s.kind === "answered").length;
  const hasUnavailable = productIds.some((pid) => unavailable.has(pid));
  const allAnswered = productIds.length > 0 && answeredCount === productIds.length;
  // (دکمه‌ی «استعلام همه‌ی محصولات» برداشته شد؛ استعلام فقط برای هر محصول جداگانه انجام می‌شود)
  const canContinue = (allAnswered || acceptFluctuation) && !hasUnavailable;

  // قیمت واقعیِ هر محصول: اگر جواب آمده همان، وگرنه قیمت امروز سایت
  const effectivePrice = (item: CartItem): number => {
    const st = stateOf(item.id);
    if (st.kind === "answered") return st.final;
    return priceOf(item);
  };

  const subtotal = items.reduce((t, i) => t + effectivePrice(i) * i.quantity, 0);
  const packagingCost = items.length > 0 ? quote?.packaging ?? PACKAGING : 0;
  const total = subtotal + packagingCost;

  // اعتبار قیمت‌ها
  const earliestLock = states
    .filter((s): s is Extract<typeof s, { kind: "answered" }> => s.kind === "answered")
    .map((s) => Date.parse(s.lockedUntil))
    .reduce<number | null>((min, v) => (min === null || v < min ? v : min), null);
  const lockText = earliestLock ? formatFaDate(earliestLock) : null;

  // اگر خیلی منتظر مانده
  const oldestWait = states
    .filter((s): s is Extract<typeof s, { kind: "waiting" }> => s.kind === "waiting")
    .map((s) => Date.parse(s.since))
    .reduce<number | null>((min, v) => (min === null || v < min ? v : min), null);
  const waitedLong = oldestWait !== null && now - oldestWait > 8 * 60 * 1000;

  // آدرس صفحه را با توکن سبد عوض می‌کنیم تا «ذخیره‌ی صفحه» همین لینک را نگه دارد
  useEffect(() => {
    if (!mounted || !token || items.length === 0) return;
    const wanted = `/cart?c=${token}`;
    if (window.location.pathname + window.location.search !== wanted) {
      window.history.replaceState(null, "", wanted);
    }
  }, [mounted, token, items.length]);

  // نسخه‌ی سبد را روی سرور به‌روز نگه می‌داریم (برای برگشت از لینک ذخیره‌شده)
  const hasAnyInquiry = Object.keys(inquiries).length > 0;
  const snapshotKey = items.map((i) => `${i.cartItemId}:${i.quantity}`).join("|") + `|${acceptFluctuation}`;
  useEffect(() => {
    if (!mounted || !token || items.length === 0 || !hasAnyInquiry) return;
    const timer = setTimeout(() => {
      fetch("/api/cart-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          items: items.map((i) => ({ id: i.id, title: i.title, price: i.price, image: i.image, quantity: i.quantity, color: i.color })),
          acceptFluctuation,
        }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, token, snapshotKey, hasAnyInquiry]);

  if (!mounted) return null;

  const handleRemove = (item: CartItem) => {
    const stillInCart = items.some((i) => i.id === item.id && i.cartItemId !== item.cartItemId);
    const wasWaiting = stateOf(item.id).kind === "waiting";
    removeFromCart(item.cartItemId);
    if (!stillInCart && wasWaiting) void cancel([item.id]);
  };

  const goCheckout = async () => {
    setLeaving(true);
    try {
      const waiting = productIds.filter((pid) => stateOf(pid).kind === "waiting");
      if (waiting.length > 0) await cancel(waiting);
      router.push("/checkout");
    } finally {
      setTimeout(() => setLeaving(false), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-primary-pink/10 p-3 rounded-2xl">
            <ShoppingBag className="w-8 h-8 text-primary-pink" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display text-text-dark">سبد خرید شما</h1>
        </div>

        {items.length > 0 ? (
          <>
            {/* مراحل */}
            <div className="flex items-center gap-2 text-sm font-bold mb-6 font-sans" aria-label="مراحل خرید">
              <span className="bg-primary-pink text-white rounded-full px-4 py-1.5">۱ . بررسی قیمت‌ها</span>
              <span className="text-gray-300">—</span>
              <span className="bg-white text-gray-400 rounded-full px-4 py-1.5 border border-gray-200">۲ . تکمیل خرید</span>
            </div>

            {!storeOpen && (
              <div role="alert" className="mb-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl p-4 font-sans flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>فروشگاه فعلاً بسته است؛ استعلام قیمت و ثبت سفارش ممکن نیست. سبد خریدت همین‌طور می‌ماند.</p>
              </div>
            )}

            {problem && (
              <div role="alert" className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 font-sans flex items-start justify-between gap-3">
                <p className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  {PROBLEM_TEXT[problem]}
                </p>
                <button type="button" onClick={clearProblem} className="text-sm font-bold underline shrink-0">
                  باشه
                </button>
              </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* لیست محصولات */}
              <div className="w-full lg:w-2/3 flex flex-col gap-4">
                {!allAnswered && (
                  <div className="bg-white border border-soft-blue rounded-2xl p-4 flex items-start gap-3 font-sans text-text-dark leading-relaxed">
                    <Lightbulb className="w-6 h-6 text-soft-yellow shrink-0 mt-0.5" aria-hidden="true" />
                    <p>
                      قیمت‌ها گاهی با نوسان بازار تغییر می‌کنند. اگر می‌خواهی مطمئن باشی، قیمت امروز هر محصول را از هنرمند ما
                      بپرس؛ معمولاً چند دقیقه بیشتر طول نمی‌کشد.
                      قیمتِ هر محصول بعد از به‌روزرسانی تا ۷ روز معتبر می‌ماند؛ تاریخ آخرین به‌روزرسانی را زیر همان
                      محصول می‌بینی و نیازی به استعلام دوباره نیست.
                    </p>
                  </div>
                )}

                <AnimatePresence>
                  {items.map((item) => {
                    const st = stateOf(item.id);
                    const isUnavailable = unavailable.has(item.id);
                    return (
                      <motion.div
                        key={item.cartItemId}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 relative"
                      >
                        {/* دکمه حذف محصول */}
                        <button
                          onClick={() => handleRemove(item)}
                          aria-label={`حذف ${item.title} از سبد`}
                          className="absolute top-3 left-3 text-gray-300 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="flex items-start gap-4">
                          {/* عکس محصول */}
                          <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-2xl bg-soft-blue/10 flex items-center justify-center overflow-hidden border border-gray-50">
                            {item.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                            ) : (
                              <ImageIcon className="w-10 h-10 text-soft-blue opacity-50" />
                            )}
                          </div>

                          {/* اطلاعات محصول */}
                          <div className="flex-1 min-w-0 text-right pl-8">
                            <h3 className="text-lg sm:text-xl font-bold text-text-dark mb-1">{item.title}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                              <p className="text-sm font-sans text-gray-400">کد: QJ-{item.id.slice(0, 4)}</p>
                              {item.color && (
                                <p className="text-sm font-sans font-bold text-gray-500 flex items-center gap-1">
                                  <Palette className="w-4 h-4 text-primary-pink" />
                                  رنگ: {item.color}
                                </p>
                              )}
                            </div>

                            {/* کنترل تعداد */}
                            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-1 w-36">
                              <button
                                onClick={() => decreaseQuantity(item.cartItemId)}
                                aria-label="کم کردن تعداد"
                                className="p-3 text-gray-500 hover:text-primary-pink transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-bold font-sans text-text-dark">{formatNumber(item.quantity)}</span>
                              <button
                                onClick={() => increaseQuantity(item.cartItemId)}
                                aria-label="زیاد کردن تعداد"
                                className="p-3 text-gray-500 hover:text-primary-pink transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* قیمت و استعلام */}
                        <div className="mt-4 font-sans">
                          {isUnavailable ? (
                            <div role="alert" className="w-full bg-red-50 border border-red-100 rounded-2xl p-4 text-red-600 font-bold">
                              این محصول الان موجود نیست. لطفاً آن را از سبد حذف کن.
                            </div>
                          ) : (
                            <PriceBox
                              state={st}
                              currentPrice={priceOf(item)}
                              busy={busy}
                              storeOpen={storeOpen}
                              onAsk={() => void askOne(item.id)}
                            />
                          )}
                          {item.quantity > 1 && !isUnavailable && (
                            <p className="text-sm text-gray-500 mt-2 text-left">
                              جمع این محصول: <span className="font-bold text-text-dark">{formatNumber(effectivePrice(item) * item.quantity)} تومان</span>
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* فاکتور نهایی و پرداخت */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full lg:w-1/3 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto"
              >
                <h3 className="text-xl font-bold text-text-dark mb-5 border-b border-gray-50 pb-4">خلاصه سفارش</h3>

                {/* وضعیت قیمت‌ها */}
                {allAnswered ? (
                  <div role="status" aria-live="polite" className="mb-5 bg-mint-green border border-green-200 rounded-2xl p-4 font-sans">
                    <p className="flex items-center gap-2 font-bold text-text-dark">
                      <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" aria-hidden="true" />
                      قیمت‌ها نهایی شد
                    </p>
                    {lockText && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        تا تاریخ {lockText} معتبر است
                      </p>
                    )}
                  </div>
                ) : hasWaiting ? (
                  <div role="status" aria-live="polite" className="mb-5 bg-soft-blue/30 border border-soft-blue rounded-2xl p-4 font-sans">
                    <p className="font-bold text-text-dark flex items-center gap-2">
                      <Loader2 className="w-5 h-5 text-primary-pink animate-spin" aria-hidden="true" />
                      در حال استعلام قیمت…
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatNumber(answeredCount)} از {formatNumber(productIds.length)} محصول جواب داده شد
                    </p>
                    <div className="mt-3 h-2 rounded-full bg-white overflow-hidden" aria-hidden="true">
                      <div
                        className="h-full bg-primary-pink transition-all duration-500"
                        style={{ width: `${Math.round((answeredCount / Math.max(1, productIds.length)) * 100)}%` }}
                      />
                    </div>
                    {waitedLong && (
                      <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                        هنوز جواب نیامده. می‌توانی منتظر بمانی، صفحه را ذخیره کنی و بعداً برگردی، یا گزینه‌ی «نوسان قیمت برایم مشکلی ندارد» را بزنی.
                      </p>
                    )}
                  </div>
                ) : null}

                <div className="flex flex-col gap-4 font-sans text-text-dark/80 mb-4">
                  <div className="flex justify-between items-center">
                    <span>مبلغ کل محصولات:</span>
                    <span className="font-bold text-text-dark">{formatNumber(subtotal)} تومان</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-500">
                    <span>هزینه ایمن‌سازی و بسته‌بندی:</span>
                    <span className="font-bold text-text-dark">{formatNumber(packagingCost)} تومان</span>
                  </div>
                </div>

                {/* 👈 باکس هشدار محترمانه برای پس‌کرایه */}
                <div className="mb-6 bg-red-50/80 border border-red-100 rounded-2xl p-4 flex items-start gap-3 text-sm text-red-500 font-sans leading-relaxed shadow-sm">
                  <Info className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
                  <p>
                    <strong>توجه:</strong> کرایه پستی به صورت <strong>پس‌کرایه</strong> می‌باشد؛ یعنی هزینه ارسال را هنگام دریافت بسته، درب منزل به مامور پست پرداخت خواهید کرد.
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-6 mb-6 flex justify-between items-center">
                  <span className="text-lg font-bold text-text-dark">{allAnswered ? "مبلغ قابل پرداخت سایت:" : "مبلغ تقریبی:"}</span>
                  <span className="text-2xl font-bold text-primary-pink">{formatNumber(total)} تومان</span>
                </div>
                {!allAnswered && (
                  <p className="text-sm text-gray-500 font-sans -mt-3 mb-6 leading-relaxed">قیمت نهایی بعد از استعلام (یا پذیرش نوسان قیمت) مشخص می‌شود.</p>
                )}

                {/* دکمه‌ی اصلی: فقط یک کار مشخص در هر لحظه */}
                {canContinue ? (
                  <button
                    type="button"
                    onClick={goCheckout}
                    disabled={leaving || !storeOpen}
                    className="w-full bg-mint-green text-text-dark flex items-center justify-center gap-2 py-4 min-h-14 rounded-2xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
                  >
                    {leaving ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : null}
                    {allAnswered ? "ادامه خرید و پرداخت" : "ادامه خرید (بدون استعلام)"}
                    <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                  </button>
                ) : hasWaiting ? (
                  <div className="w-full bg-gray-100 text-gray-500 flex items-center justify-center gap-2 py-4 min-h-14 rounded-2xl font-bold text-lg">
                    <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                    منتظر جواب هنرمند…
                  </div>
                ) : (
                  <div
                    role="status"
                    className="w-full bg-gray-100 text-gray-600 flex items-start gap-2 p-4 rounded-2xl font-sans text-sm leading-relaxed"
                  >
                    <Info className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                    <p>
                      {hasUnavailable
                        ? "یکی از محصولات الان موجود نیست؛ آن را از سبد حذف کن تا بتوانی ادامه بدهی."
                        : "برای ادامه، زیر هر محصول روی «استعلام قیمت امروز» بزن؛ یا گزینه‌ی «نوسان قیمت برایم مشکلی ندارد» را انتخاب کن."}
                    </p>
                  </div>
                )}

                {/* گزینه‌ی دوم: بدون انتظار */}
                {!allAnswered && (
                  <label
                    className={`mt-5 flex items-start gap-3 cursor-pointer rounded-2xl p-4 border-2 transition-colors font-sans ${
                      acceptFluctuation ? "border-primary-pink bg-primary-pink/5" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={acceptFluctuation}
                      onChange={(e) => setAcceptFluctuation(e.target.checked)}
                      className="mt-1 w-6 h-6 shrink-0 accent-[#FF6B81]"
                    />
                    <span>
                      <span className="block font-bold text-text-dark leading-relaxed">
                        نوسان قیمت برایم مشکلی ندارد؛ نمی‌خواهم منتظر استعلام بمانم.
                      </span>
                      <span className="block text-sm text-gray-500 mt-1 leading-relaxed">
                        سفارشم با همین قیمت‌ها ثبت شود. اگر قیمت روز بالاتر بود، شماره کارت را برایم بفرستید تا فقط مبلغ اضافه را واریز کنم.
                      </span>
                    </span>
                  </label>
                )}

                {/* ذخیره‌ی صفحه و برگشت بعد از چند دقیقه */}
                {hasWaiting && token && !acceptFluctuation && (
                  <div className="mt-5 font-sans">
                    <SaveForLater token={token} />
                  </div>
                )}

                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 font-sans bg-gray-50 p-3 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-soft-blue" />
                  <span>پرداخت امن و تضمین کیفیت توسط تیم حرفه‌ای ما</span>
                </div>
              </motion.div>
            </div>
          </>
        ) : (
          /* حالت سبد خرید خالی */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center max-w-2xl mx-auto"
          >
            <div className="bg-gray-50 p-6 rounded-full mb-6">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-2xl font-bold text-text-dark mb-2">سبد خرید شما خالی است!</h2>
            <p className="text-gray-500 font-sans mb-8">هنوز هیچ یک از هنر‌های دست تیم ما رو انتخاب نکردید.</p>
            <Link
              href="/shop"
              className="bg-primary-pink text-white px-8 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2"
            >
              مشاهده فروشگاه
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
