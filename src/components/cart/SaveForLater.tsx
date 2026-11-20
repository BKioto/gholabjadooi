// مسیر فایل: src/components/cart/SaveForLater.tsx
// «ذخیره‌ی این صفحه»: مشتری می‌تواند صفحه را روی گوشی/کامپیوتر ذخیره کند و چند دقیقه بعد برگردد.
"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Check, Copy, Share2, X } from "lucide-react";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent || "";
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

const STEPS: Record<Platform, string[]> = {
  ios: [
    "پایین صفحه، روی دکمه‌ی اشتراک‌گذاری (مربعی با فلش رو به بالا) بزن.",
    "گزینه‌ی «افزودن به صفحه اصلی» (Add to Home Screen) را بزن.",
    "روی «افزودن» (Add) بزن. تمام!",
  ],
  android: [
    "بالای صفحه، روی سه‌نقطه (⋮) بزن.",
    "گزینه‌ی «افزودن به صفحه اصلی» (Add to Home screen) را بزن.",
    "تأیید کن. تمام!",
  ],
  desktop: [
    "کلیدهای Ctrl و D را با هم بزن (در مک: ⌘ و D).",
    "روی «انجام شد» (Done) بزن تا صفحه ذخیره شود.",
  ],
};

export default function SaveForLater({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const noop = () => () => {};
  const platform = useSyncExternalStore(noop, detectPlatform, (): Platform => "desktop");
  const canShare = useSyncExternalStore(
    noop,
    () => typeof navigator.share === "function",
    () => false
  );

  const link = () => `${window.location.origin}/cart?c=${token}`;

  const copyLink = async () => {
    const url = link();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
      } catch {
        /* بی‌صدا */
      }
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const share = async () => {
    try {
      await navigator.share({ title: "سبد خرید قلاب جادویی", text: "سبد خرید من در قلاب جادویی", url: link() });
    } catch {
      /* مشتری بستن را زد */
    }
  };

  return (
    <div className="bg-soft-blue/20 border border-soft-blue/60 rounded-2xl p-4">
      <p className="font-bold text-text-dark mb-1">نمی‌خواهی منتظر بمانی؟</p>
      <p className="text-sm text-gray-600 leading-relaxed mb-3">
        این صفحه را ذخیره کن و ۵ تا ۱۰ دقیقه‌ی دیگر برگرد. سبد خریدت همین‌طور می‌ماند و هیچ‌چیزش تغییر نمی‌کند؛ خیالت راحت باشد.
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-white border-2 border-primary-pink text-primary-pink font-bold hover:bg-primary-pink hover:text-white transition-colors"
      >
        <Bookmark className="w-5 h-5" aria-hidden="true" />
        ذخیره‌ی این صفحه
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="ذخیره‌ی صفحه"
              className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-text-dark">ذخیره‌ی این صفحه</h3>
                <button type="button" onClick={() => setOpen(false)} aria-label="بستن" className="p-2 text-gray-400 hover:text-text-dark">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <ol className="flex flex-col gap-3 mb-5">
                {STEPS[platform].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-9 h-9 shrink-0 rounded-full bg-primary-pink text-white font-bold flex items-center justify-center">
                      {(i + 1).toLocaleString("fa-IR")}
                    </span>
                    <span className="pt-1 text-text-dark leading-relaxed">{text}</span>
                  </li>
                ))}
              </ol>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-500 mb-3">یا لینک این صفحه را برای خودت نگه دار:</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={copyLink}
                    className="min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-mint-green text-text-dark font-bold"
                  >
                    {copied ? <Check className="w-5 h-5" aria-hidden="true" /> : <Copy className="w-5 h-5" aria-hidden="true" />}
                    {copied ? "لینک کپی شد" : "کپی لینک"}
                  </button>
                  {canShare && (
                    <button
                      type="button"
                      onClick={share}
                      className="min-h-12 inline-flex items-center justify-center gap-2 rounded-2xl bg-gray-50 border border-gray-200 text-text-dark font-bold"
                    >
                      <Share2 className="w-5 h-5" aria-hidden="true" />
                      ارسال لینک (پیام‌رسان، یادداشت و ...)
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
