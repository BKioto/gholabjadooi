// مسیر فایل: src/app/checkout/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  MapPin,
  Phone,
  CreditCard,
  ShieldCheck,
  Truck,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Info,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useInquiryStore } from "@/store/inquiryStore";
import { formatCardNumber, formatNumber, isValidIranMobile, normalizeDigits } from "@/lib/price-utils";
import { useIsClient } from "@/lib/useIsClient";
import type { Quote } from "@/lib/quote-types";

interface FormState {
  name: string;
  phone: string;
  address: string;
  postalCode: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

interface Notice {
  type: "warn" | "error";
  text: string;
}

const JSON_HEADERS = { "Content-Type": "application/json" };

const inputClass =
  "w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-10 pl-4 text-text-dark placeholder-gray-400 focus:outline-none focus:border-primary-pink focus:ring-1 focus:ring-primary-pink transition-all";

async function fetchQuote(body: unknown): Promise<Quote | null> {
  try {
    const res = await fetch("/api/checkout/quote", { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) });
    const data = (await res.json()) as Quote;
    return data?.ok ? data : null;
  } catch {
    return null;
  }
}

function validate(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (form.name.trim().length < 2) errors.name = "نام و نام خانوادگی را کامل بنویس.";
  if (!isValidIranMobile(form.phone)) errors.phone = "شماره موبایل را درست بنویس (مثلاً ۰۹۱۲۳۴۵۶۷۸۹).";
  if (form.address.trim().length < 8) errors.address = "آدرس را کامل‌تر بنویس (استان، شهر، خیابان و پلاک).";
  const postal = normalizeDigits(form.postalCode).replace(/\D/g, "");
  if (form.postalCode.trim() !== "" && postal.length !== 10) errors.postalCode = "کد پستی باید ۱۰ رقم باشد (یا خالی بگذار).";
  return errors;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const acceptFluctuation = useInquiryStore((s) => s.acceptFluctuation);

  const mounted = useIsClient();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", phone: "", address: "", postalCode: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [notice, setNotice] = useState<Notice | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ orderCode: string; priceMode: string | null } | null>(null);
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const quoteBody = useCallback(
    () => ({
      token: useInquiryStore.getState().ensureToken(),
      items: items.map((i) => ({ productId: i.id, color: i.color, quantity: i.quantity })),
      acceptFluctuation,
    }),
    [items, acceptFluctuation]
  );

  const loadQuote = useCallback(async (): Promise<Quote | null> => {
    const data = await fetchQuote(quoteBody());
    if (data) {
      setQuoteError(false);
      setQuote(data);
    } else {
      setQuoteError(true);
    }
    return data;
  }, [quoteBody]);

  useEffect(() => {
    if (!mounted || success) return;
    if (items.length === 0) {
      router.push("/shop");
      return;
    }
    let cancelled = false;
    void fetchQuote(quoteBody()).then((data) => {
      if (cancelled) return;
      if (data) {
        setQuoteError(false);
        setQuote(data);
      } else {
        setQuoteError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [mounted, success, items.length, quoteBody, router]);

  if (!mounted) return null;

  const update = (key: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleCopyCard = async () => {
    if (!quote?.payment) return;
    try {
      await navigator.clipboard.writeText(quote.payment.cardNumber.replace(/\D/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setNotice({ type: "warn", text: "کپی انجام نشد؛ شماره کارت را با دست انتخاب و کپی کن." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote || submitting) return;

    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setNotice({ type: "warn", text: "چند مورد را درست پر نکرده‌ای؛ موارد قرمز را اصلاح کن." });
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ ...quoteBody(), expectedTotal: quote.total, customer: form }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data?.ok) {
        setSuccess({ orderCode: String(data.orderCode ?? ""), priceMode: data.priceMode ?? null });
        clearCart();
        useInquiryStore.getState().reset();
        return;
      }

      switch (data?.reason) {
        case "price_changed":
          if (data.quote) setQuote({ ...(data.quote as Quote), payment: quote.payment });
          setNotice({ type: "warn", text: "قیمت‌ها در این فاصله تغییر کرد. مبلغ جدید را ببین و اگر موافقی دوباره دکمه‌ی ثبت را بزن." });
          break;
        case "not_orderable":
          await loadQuote();
          setNotice({ type: "warn", text: "اعتبار قیمت‌ها تمام شده یا محصولی تغییر کرده است. لطفاً به سبد خرید برگرد." });
          break;
        case "bad_name":
        case "bad_phone":
        case "bad_address":
        case "bad_postal":
          setErrors(validate(form));
          setNotice({ type: "warn", text: "اطلاعات واردشده درست نیست؛ موارد قرمز را اصلاح کن." });
          break;
        case "payment_not_ready":
          setNotice({ type: "error", text: "اطلاعات پرداخت هنوز آماده نیست. لطفاً کمی بعد دوباره امتحان کن یا با ما تماس بگیر." });
          break;
        default:
          setNotice({ type: "error", text: "ثبت سفارش انجام نشد. لطفاً دوباره امتحان کن." });
      }
    } catch {
      setNotice({ type: "error", text: "ارتباط با سرور برقرار نشد. اینترنتت را چک کن و دوباره امتحان کن." });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------------------------------------------------- موفقیت
  if (success) {
    const unconfirmed = success.priceMode === "fluctuation" || success.priceMode === "mixed";
    return (
      <div className="min-h-screen bg-gray-50/50 py-12 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 text-center flex flex-col items-center max-w-lg w-full"
        >
          <div className="bg-mint-green p-5 rounded-full mb-6">
            <CheckCircle2 className="w-14 h-14 text-green-600" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-display text-text-dark mb-3">سفارش شما ثبت شد!</h1>
          <p className="text-gray-500 font-sans leading-relaxed mb-6">
            سپاس از خرید شما. تیم ما پس از بررسی پرداخت، بافتن سفارش را شروع می‌کند و از طریق پیام‌رسان با شما در تماس خواهد بود.
          </p>

          <div className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-500 font-sans mb-1">کد سفارش شما</p>
            <p dir="ltr" className="text-3xl font-bold font-sans text-primary-pink tracking-wider">
              {success.orderCode}
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(success.orderCode);
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2500);
                } catch {
                  /* بی‌صدا */
                }
              }}
              className="mt-2 text-sm font-bold font-sans text-text-dark inline-flex items-center gap-1"
            >
              {codeCopied ? <Check className="w-4 h-4" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
              {codeCopied ? "کپی شد" : "کپی کد"}
            </button>
            <p className="text-xs text-gray-400 font-sans mt-2">این کد را نگه دار؛ برای پیگیری سفارش لازم می‌شود.</p>
          </div>

          {unconfirmed && (
            <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-right text-sm text-amber-800 font-sans leading-relaxed">
              قیمت این سفارش استعلام نشده بود. اگر قیمت روز تغییر کرده باشد، شماره کارت را برایت می‌فرستیم تا فقط مبلغ اضافه را واریز کنی.
            </div>
          )}

          <Link
            href="/"
            className="bg-primary-pink text-white px-8 py-3 min-h-12 rounded-full font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2"
          >
            بازگشت به صفحه اصلی
            <ArrowRight className="w-5 h-5 rotate-180" aria-hidden="true" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // ---------------------------------------------------------------- در حال بررسی
  if (!quote && !quoteError) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-12 flex items-center justify-center px-4">
        <div role="status" aria-live="polite" className="flex items-center gap-3 text-text-dark font-bold">
          <Loader2 className="w-7 h-7 text-primary-pink animate-spin" aria-hidden="true" />
          در حال بررسی قیمت‌ها…
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50/50 py-12 flex items-center justify-center px-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-text-dark mb-2">ارتباط با سرور برقرار نشد</h1>
          <p className="text-gray-500 font-sans mb-6">اینترنتت را چک کن و دوباره امتحان کن.</p>
          <button
            type="button"
            onClick={() => {
              setQuoteError(false);
              void loadQuote();
            }}
            className="bg-primary-pink text-white px-8 py-3 min-h-12 rounded-full font-bold"
          >
            تلاش دوباره
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- هنوز قیمت نهایی نشده
  if (!quote.canOrder) {
    const closed = quote.reasons.includes("store_closed");
    const unavailable = quote.reasons.includes("unavailable");
    return (
      <div className="min-h-screen bg-gray-50/50 py-12 flex items-center justify-center px-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100 text-center max-w-lg w-full">
          <div className="bg-amber-50 p-4 rounded-full w-fit mx-auto mb-5">
            <Info className="w-10 h-10 text-amber-500" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold text-text-dark mb-3">
            {closed ? "فروشگاه فعلاً بسته است" : unavailable ? "یکی از محصولات الان موجود نیست" : "قیمت‌ها هنوز نهایی نشده"}
          </h1>
          <p className="text-gray-500 font-sans leading-relaxed mb-7">
            {closed
              ? "وقتی فروشگاه باز شد می‌توانی خریدت را کامل کنی. سبد خریدت همین‌طور می‌ماند."
              : unavailable
                ? "لطفاً به سبد خرید برگرد و آن محصول را حذف کن."
                : "برای ادامه، به سبد خرید برگرد و قیمت امروز را از هنرمند بپرس. اگر اعتبار قیمتِ قبلی تمام شده، دوباره بپرس."}
          </p>
          <Link
            href="/cart"
            className="bg-primary-pink text-white px-8 py-3 min-h-12 rounded-full font-bold shadow-md hover:scale-105 transition-transform inline-flex items-center gap-2"
          >
            بازگشت به سبد خرید
          </Link>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------- صفحه‌ی اصلی پرداخت
  const lockText = quote.lockedUntil
    ? new Date(quote.lockedUntil).toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" })
    : null;
  const unconfirmed = quote.priceMode === "fluctuation" || quote.priceMode === "mixed";

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center gap-1 text-sm font-bold font-sans text-gray-500 hover:text-primary-pink mb-4">
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
            بازگشت به سبد خرید
          </Link>
          <h1 className="text-3xl sm:text-4xl font-display text-text-dark">تکمیل خرید و ثبت اطلاعات</h1>
        </div>

        {notice && (
          <div
            role="alert"
            className={`mb-6 rounded-2xl p-4 font-sans flex items-start gap-3 border ${
              notice.type === "error" ? "bg-red-50 border-red-100 text-red-600" : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <p>{notice.text}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ستون راست: فرم اطلاعات */}
          <motion.form
            noValidate
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-3/5 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-8 border-b border-gray-50 pb-4">
              <div className="bg-soft-blue/20 p-2 rounded-xl">
                <Truck className="w-6 h-6 text-soft-blue" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-bold text-text-dark">اطلاعات تحویل گیرنده</h2>
            </div>

            <div className="flex flex-col gap-5 font-sans">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-text-dark mb-2">
                  نام و نام خانوادگی
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="مثلاً: سارا محمدی"
                    aria-invalid={Boolean(errors.name)}
                    className={inputClass}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-bold text-text-dark mb-2">
                  شماره موبایل
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    dir="ltr"
                    aria-invalid={Boolean(errors.phone)}
                    className={`${inputClass} text-left`}
                  />
                </div>
                {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-bold text-text-dark mb-2">
                  آدرس کامل پستی
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-3.5 w-5 h-5 text-gray-400" aria-hidden="true" />
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="استان، شهر، خیابان، کوچه، پلاک، واحد"
                    aria-invalid={Boolean(errors.address)}
                    className={`${inputClass} resize-none`}
                  />
                </div>
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-bold text-text-dark mb-2">
                  کد پستی <span className="font-normal text-gray-400">(اختیاری)</span>
                </label>
                <input
                  id="postalCode"
                  name="postalCode"
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={form.postalCode}
                  onChange={(e) => update("postalCode", e.target.value)}
                  placeholder="۱۰ رقم"
                  dir="ltr"
                  aria-invalid={Boolean(errors.postalCode)}
                  className={`${inputClass.replace("pr-10", "pr-4")} text-left`}
                />
                {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
              </div>
            </div>

            {/* دکمه ثبت نهایی (فقط وقتی اطلاعات پرداخت آماده است) */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={submitting || !quote.payment}
                className="w-full bg-primary-pink text-white font-bold text-lg py-4 min-h-14 rounded-2xl hover:shadow-lg hover:scale-[1.01] transition-all disabled:opacity-60 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="w-5 h-5" aria-hidden="true" />}
                {submitting ? "در حال ثبت سفارش…" : "مبلغ را واریز کردم؛ ثبت نهایی سفارش"}
              </button>
              <p className="text-xs text-gray-400 font-sans text-center mt-3">
                این دکمه را بعد از واریز مبلغ بزن. تیم ما پرداخت را بررسی می‌کند.
              </p>
            </div>
          </motion.form>

          {/* ستون چپ: فاکتور و کارت */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-2/5 flex flex-col gap-6 lg:sticky lg:top-28"
          >
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 font-sans">
              <h3 className="text-lg font-bold text-text-dark mb-4">فاکتور شما</h3>
              <ul className="flex flex-col gap-3 mb-4 text-sm">
                {quote.lines.map((l, idx) => (
                  <li key={`${l.productId}-${idx}`} className="flex items-start justify-between gap-3">
                    <span className="text-text-dark/80">
                      {l.title}
                      {l.color ? ` (${l.color})` : ""} × {formatNumber(l.quantity)}
                    </span>
                    <span className="font-bold text-text-dark whitespace-nowrap">
                      {formatNumber(l.lineTotal)}
                      {l.state === "confirmed" ? " ✓" : ""}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 pt-3 flex flex-col gap-2 text-sm text-text-dark/80">
                <div className="flex justify-between">
                  <span>مبلغ محصولات:</span>
                  <span className="font-bold text-text-dark">{formatNumber(quote.subtotal)} تومان</span>
                </div>
                <div className="flex justify-between">
                  <span>هزینه ایمن‌سازی و بسته‌بندی:</span>
                  <span className="font-bold text-text-dark">{formatNumber(quote.packaging)} تومان</span>
                </div>
              </div>
              <div className="border-t border-gray-100 mt-3 pt-4 flex justify-between items-center">
                <span className="font-bold text-text-dark">مبلغ قابل پرداخت:</span>
                <span className="text-2xl font-bold text-primary-pink">{formatNumber(quote.total)} تومان</span>
              </div>
              {lockText && !unconfirmed && (
                <p className="mt-3 text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  قیمت‌ها تا ساعت {lockText} معتبر است
                </p>
              )}
            </div>

            {unconfirmed && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800 font-sans leading-relaxed">
                شما پذیرفته‌اید که قیمت‌ها ممکن است با نوسان بازار تغییر کرده باشند. اگر قیمت روز بالاتر بود، شماره کارت را برایتان
                می‌فرستیم و فقط مبلغ اضافه را واریز می‌کنید.
              </div>
            )}

            {/* کارت پرداخت */}
            <div className="bg-gradient-to-br from-soft-blue/30 to-mint-green/50 p-6 rounded-3xl border border-soft-blue/50">
              <div className="flex items-center gap-2 mb-4 text-text-dark font-bold">
                <CreditCard className="w-6 h-6 text-primary-pink" aria-hidden="true" />
                پرداخت کارت‌به‌کارت
              </div>
              {quote.payment ? (
                <div className="font-sans">
                  <p className="text-sm text-text-dark/80 mb-3 leading-relaxed">
                    مبلغ <strong>{formatNumber(quote.total)} تومان</strong> را به این کارت واریز کن، بعد دکمه‌ی «ثبت نهایی سفارش» را بزن:
                  </p>
                  <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <p dir="ltr" className="text-2xl font-bold tracking-widest text-text-dark text-center mb-1">
                      {formatCardNumber(quote.payment.cardNumber)}
                    </p>
                    {quote.payment.cardOwnerName && (
                      <p className="text-center text-sm text-gray-500 mb-3">به نام: {quote.payment.cardOwnerName}</p>
                    )}
                    <button
                      type="button"
                      onClick={handleCopyCard}
                      className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-mint-green text-text-dark font-bold"
                    >
                      {copied ? <Check className="w-5 h-5" aria-hidden="true" /> : <Copy className="w-5 h-5" aria-hidden="true" />}
                      {copied ? "شماره کارت کپی شد" : "کپی شماره کارت"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white/80 rounded-2xl p-4 text-sm text-amber-800 font-sans leading-relaxed">
                  اطلاعات پرداخت هنوز آماده نیست. لطفاً کمی بعد دوباره سر بزن یا از طریق پیام‌رسان با ما در تماس باش.
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 font-sans bg-white p-3 rounded-xl border border-gray-100">
              <ShieldCheck className="w-5 h-5 text-soft-blue" aria-hidden="true" />
              <span>اطلاعات شما فقط برای ارسال سفارش استفاده می‌شود</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
