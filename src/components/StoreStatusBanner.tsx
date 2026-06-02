// مسیر فایل: src/components/StoreStatusBanner.tsx
"use client";

import { Store, Lock } from "lucide-react";

export default function StoreStatusBanner({ isOpen }: { isOpen: boolean }) {
  // اگر فروشگاه باز بود، این کامپوننت اصلاً رندر نمی‌شه
  if (isOpen) return null;

  return (
    <div className="bg-primary-pink/5 border-b border-primary-pink/20 py-3 px-4 w-full backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-right">
        
        {/* باکس آیکون‌های شیک و حرفه‌ای */}
        <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm border border-primary-pink/10 shrink-0 relative">
          <Store className="w-5 h-5 text-primary-pink" />
          <div className="absolute -bottom-1 -right-1 bg-gray-100 rounded-full p-1 border border-white shadow-sm">
            <Lock className="w-3 h-3 text-gray-600" />
          </div>
        </div>
        
        {/* متن مینیمال، رسمی و باکلاس */}
        <div className="flex flex-col">
          <h3 className="text-text-dark font-bold text-sm sm:text-base">
            فروشگاه در حال حاضر بسته است
          </h3>
          <p className="text-gray-500 font-sans text-xs sm:text-sm mt-0.5">
            امکان ثبت سفارش جدید موقتاً غیرفعال می‌باشد. از همراهی و شکیبایی شما سپاسگزاریم.
          </p>
        </div>
        
      </div>
    </div>
  );
}