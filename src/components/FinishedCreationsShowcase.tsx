// مسیر فایل: src/components/FinishedCreationsShowcase.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ZoomIn, X, CheckCircle2, ChevronDown } from "lucide-react";

export interface ShowcaseItem {
  id: string;
  title?: string | null;
  image_url: string;
  storage_path: string;
  width?: number | null;
  height?: number | null;
  file_size_kb?: number | null;
  created_at: string;
}

export default function FinishedCreationsShowcase({ items }: { items: ShowcaseItem[] }) {
  const [selectedItem, setSelectedItem] = useState<ShowcaseItem | null>(null);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    if (selectedItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedItem]);

  // اگر هنوز عکسی آپلود نشده باشد، بخش نمایش داده نمی‌شود تا ظاهر سایت همیشه تمیز بماند
  if (!items || items.length === 0) return null;

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <section className="py-20 relative overflow-hidden">
      {/* هاله‌های نوری ملایم در پس‌زمینه */}
      <div className="absolute top-12 right-8 w-80 h-80 bg-primary-pink/10 rounded-full blur-[90px] -z-10 pointer-events-none" />
      <div className="absolute bottom-12 left-8 w-80 h-80 bg-mint-green/30 rounded-full blur-[90px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* هدر بخش */}
        <div className="text-center mb-14">
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-5 py-2 rounded-full border border-primary-pink/20 shadow-sm mb-5"
          >
            <Sparkles className="w-4 h-4 text-primary-pink animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-primary-pink">
              تازه از کارگاه قلاب جادویی
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-display text-text-dark mb-4"
          >
            آخرین <span className="text-primary-pink">دست‌بافت‌های آماده شده</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-sm sm:text-lg font-sans text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            قاب‌هایی واقعی از سفارش‌ها و دست‌سازه‌هایی که به تازگی گره‌به‌گره با عشق بافته و آماده تحویل شده‌اند
          </motion.p>
        </div>

        {/* چیدمان پینترستی (Masonry) برای نمایش طبیعی عکس‌های عمودی، افقی و مربعی */}
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {visibleItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (index % 4) * 0.08 }}
              onClick={() => setSelectedItem(item)}
              className="break-inside-avoid group relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white border-2 border-white shadow-sm hover:shadow-xl transition-all duration-500 cursor-zoom-in"
            >
              {/* تصویر با حفظ نسبت ابعاد واقعی (عمودی / افقی / مربعی) */}
              <div className="relative w-full overflow-hidden bg-soft-blue/15">
                <img
                  src={item.image_url}
                  alt={item.title || "دست‌بافت آماده شده در قلاب جادویی"}
                  loading="lazy"
                  width={item.width || 800}
                  height={item.height || 800}
                  className="w-full h-auto block object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* بج ظریف بالا سمت راست */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm border border-white/60">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 -mr-3.5" />
                  <span className="text-[10px] sm:text-xs font-bold text-text-dark">
                    آماده شده
                  </span>
                </div>

                {/* لایه هاور شیشه‌ای و دکمه بزرگنمایی */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300 flex items-end justify-between gap-2">
                    <div className="text-right">
                      {item.title ? (
                        <h3 className="text-white font-bold text-xs sm:text-sm leading-snug drop-shadow-sm">
                          {item.title}
                        </h3>
                      ) : (
                        <span className="text-white/95 font-bold text-xs sm:text-sm drop-shadow-sm">
                          بافته شده با دست
                        </span>
                      )}
                      <p className="text-[10px] text-white/75 font-sans mt-0.5">
                        {new Date(item.created_at).toLocaleDateString("fa-IR", {
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-text-dark shrink-0 shadow-md">
                      <ZoomIn className="w-4 h-4 text-primary-pink" />
                    </div>
                  </div>
                </div>
              </div>

              {/* نمایش عنوان در موبایل (زیر عکس در صورت وجود عنوان) */}
              {item.title && (
                <div className="p-3 bg-white sm:hidden border-t border-gray-50">
                  <p className="text-xs font-bold text-text-dark truncate text-right">
                    {item.title}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* دکمه نمایش بیشتر در صورتی که تعداد عکس‌ها زیاد باشد */}
        {hasMore && (
          <div className="text-center mt-12">
            <button
              onClick={() => setVisibleCount((prev) => prev + 8)}
              className="inline-flex items-center gap-2 bg-white hover:bg-primary-pink text-text-dark hover:text-white border-2 border-primary-pink/20 hover:border-primary-pink font-bold py-3.5 px-8 rounded-full shadow-sm hover:shadow-lg transition-all duration-300 text-sm sm:text-base cursor-pointer"
            >
              <span>مشاهده دست‌بافت‌های بیشتر</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* مودال تمام‌صفحه (Lightbox) برای مشاهده ژورنالی عکس */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
          >
            <button
              onClick={() => setSelectedItem(null)}
              aria-label="بستن تصویر"
              className="absolute top-5 right-5 p-3 bg-white/15 hover:bg-primary-pink rounded-full text-white transition-all z-50 shadow-lg backdrop-blur-md cursor-pointer"
            >
              <X className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full flex flex-col items-center justify-center"
            >
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title || "دست‌بافت آماده شده در قلاب جادویی"}
                className="max-w-full max-h-[78vh] w-auto h-auto object-contain rounded-3xl shadow-2xl border-2 border-white/20"
              />

              <div className="mt-4 bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-lg flex flex-wrap items-center justify-between gap-4 max-w-md w-full">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="font-bold text-sm text-text-dark">
                    {selectedItem.title || "دست‌بافت آماده شده در کارگاه قلاب جادویی"}
                  </span>
                </div>
                <span className="text-xs text-gray-400 font-sans">
                  {new Date(selectedItem.created_at).toLocaleDateString("fa-IR")}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}