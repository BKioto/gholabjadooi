// مسیر فایل: src/components/CategorySeoBox.tsx

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { categorySeoDictionary } from "@/data/seo";

export default function CategorySeoBox({ slug }: { slug: string }) {
  const [isExpanded, setIsExpanded] = useState(false);

  // دریافت دیتای سئو بر اساس اسلاگ صفحه
  const seoData = categorySeoDictionary[slug];

  // اگر برای این دسته‌بندی محتوایی ننوشته بودیم، چیزی رندر نشه
  if (!seoData) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 p-6 sm:p-10 relative overflow-hidden">
        
        {/* هدر باکس سئو */}
        <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
          <div className="bg-primary-pink/10 p-2.5 rounded-2xl">
            <Sparkles className="w-6 h-6 text-primary-pink" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display text-text-dark">
            {seoData.title}
          </h2>
        </div>

        {/* محتوای متنی با قابلیت باز و بسته شدن */}
        <div className="relative">
          <motion.div
            initial={false}
            animate={{ height: isExpanded ? "auto" : "250px" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {/* رندر محتوای غنی که در فایل‌های جداگانه نوشتیم */}
            {seoData.content}
          </motion.div>

          {/* هاله محو و دکمه باز کردن (وقتی بسته است) */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-2"
              >
                <button
                  onClick={() => setIsExpanded(true)}
                  className="bg-gray-50 hover:bg-primary-pink hover:text-white text-text-dark border border-gray-200 hover:border-primary-pink px-6 py-3 rounded-full font-bold font-sans text-sm flex items-center gap-2 transition-all shadow-sm hover:shadow-md z-10"
                >
                  مطالعه کامل توضیحات
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* دکمه بستن (وقتی باز است) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mt-8 pt-6 border-t border-gray-50"
            >
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-primary-pink font-bold font-sans text-sm flex items-center gap-1 transition-colors"
              >
                بستن توضیحات
                <ChevronDown className="w-4 h-4 rotate-180" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}