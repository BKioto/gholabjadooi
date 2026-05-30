"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function QuickAddToCartButton({ product }: { product: any }) {
  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); 
    
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: 1,
    });
  };

  return (
    <button
      onClick={handleAddToCart}
      // پدینگ و سایز آیکون در موبایل کوچکتر شده تا در چیدمان ۲ ستونه جا بشه
      className="bg-soft-blue text-text-dark hover:bg-primary-pink hover:text-white p-2 sm:p-2.5 rounded-xl transition-all shadow-sm shrink-0"
      title="افزودن به سبد خرید"
    >
      <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  );
}