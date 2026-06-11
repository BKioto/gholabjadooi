// مسیر فایل: src/components/QuickAddToCartButton.tsx
"use client";

import { ShoppingBag, Lock } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function QuickAddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const [isOpen, setIsOpen] = useState(true);

  // بررسی وضعیت فروشگاه در سمت کلاینت
  useEffect(() => {
    const checkStoreStatus = async () => {
      const { data } = await supabase.from('store_settings').select('is_open').eq('id', 1).single();
      if (data) setIsOpen(data.is_open);
    };
    checkStoreStatus();
  }, []);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    if (!isOpen) return; // اگر فروشگاه بسته است، کلیک کار نکنه
    
    // 👈 بررسی می‌کنیم آیا محصول رنگ‌بندی دارد؟ اگر بله، رنگ اول را پیش‌فرض در نظر بگیر
    const defaultColor = product.attributes?.colors?.[0] || undefined;

    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: 1,
      ...(defaultColor ? { color: defaultColor } : {}) // 👈 ارسال رنگ پیش‌فرض در صورت وجود
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={!isOpen}
      className={`p-2 sm:p-2.5 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center
        ${isOpen 
          ? 'bg-soft-blue text-text-dark hover:bg-primary-pink hover:text-white' 
          : 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-70 border border-gray-200'
        }`}
      title={isOpen ? "افزودن به سبد خرید" : "فروشگاه موقتاً بسته است"}
    >
      {isOpen ? (
        <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </button>
  );
}