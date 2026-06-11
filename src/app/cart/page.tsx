// مسیر فایل: src/app/cart/page.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, ShieldCheck, Image as ImageIcon, Palette } from "lucide-react"; // 👈 آیکون پالت رنگ اضافه شد
import { useCartStore } from "@/store/cartStore";

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  
  // خواندن توابع و محصولات از حافظه سبد خرید (Zustand)
  const { items, removeFromCart, increaseQuantity, decreaseQuantity, getTotalPrice } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const subtotal = getTotalPrice();
  const shippingCost = items.length > 0 ? 50000 : 0; // هزینه ارسال ثابت
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-primary-pink/10 p-3 rounded-2xl">
            <ShoppingBag className="w-8 h-8 text-primary-pink" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-display text-text-dark">سبد خرید شما</h1>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* لیست محصولات */}
            <div className="w-full lg:w-2/3 flex flex-col gap-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div 
                    key={item.cartItemId} // 👈 تغییر به شناسه یکتای جدید
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-4 sm:p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 relative"
                  >
                    {/* دکمه حذف محصول */}
                    <button 
                      onClick={() => removeFromCart(item.cartItemId)} // 👈 تغییر به شناسه یکتای جدید
                      className="absolute top-4 left-4 text-gray-300 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    {/* عکس محصول */}
                    <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-2xl bg-soft-blue/10 flex items-center justify-center overflow-hidden border border-gray-50">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-soft-blue opacity-50" />
                      )}
                    </div>

                    {/* اطلاعات محصول */}
                    <div className="flex-1 text-center sm:text-right w-full mt-4 sm:mt-0">
                      <h3 className="text-xl font-bold text-text-dark mb-1">{item.title}</h3>
                      
                      {/* 👈 نمایش رنگ و کد محصول */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-start gap-2 mb-4">
                        <p className="text-sm font-sans text-gray-400">کد: QJ-{item.id.slice(0, 4)}</p>
                        {item.color && (
                          <>
                            <span className="hidden sm:inline text-gray-300">|</span>
                            <p className="text-sm font-sans font-bold text-gray-500 flex items-center gap-1">
                              <Palette className="w-4 h-4 text-primary-pink" />
                              رنگ: {item.color}
                            </p>
                          </>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <div className="text-primary-pink font-bold text-lg">
                          {item.price.toLocaleString("fa-IR")} <span className="text-sm font-normal text-gray-400">تومان</span>
                        </div>
                        
                        {/* کنترل تعداد */}
                        <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-1 w-32">
                          <button onClick={() => decreaseQuantity(item.cartItemId)} className="p-2 text-gray-500 hover:text-primary-pink transition-colors">
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-bold font-sans text-text-dark">{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item.cartItemId)} className="p-2 text-gray-500 hover:text-primary-pink transition-colors">
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* فاکتور نهایی و پرداخت */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full lg:w-1/3 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-28"
            >
              <h3 className="text-xl font-bold text-text-dark mb-6 border-b border-gray-50 pb-4">خلاصه سفارش</h3>
              
              <div className="flex flex-col gap-4 font-sans text-text-dark/80 mb-6">
                <div className="flex justify-between items-center">
                  <span>مبلغ کل محصولات:</span>
                  <span className="font-bold text-text-dark">{subtotal.toLocaleString("fa-IR")} تومان</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>هزینه بسته‌بندی و ارسال:</span>
                  <span className="font-bold text-text-dark">{shippingCost.toLocaleString("fa-IR")} تومان</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6 mb-8 flex justify-between items-center">
                <span className="text-lg font-bold text-text-dark">مبلغ قابل پرداخت:</span>
                <span className="text-2xl font-bold text-primary-pink">{total.toLocaleString("fa-IR")} تومان</span>
              </div>

              <Link href="/checkout" className="w-full bg-mint-green text-text-dark flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all">
                تکمیل خرید و پرداخت
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-400 font-sans bg-gray-50 p-3 rounded-xl">
                <ShieldCheck className="w-5 h-5 text-soft-blue" />
                <span>پرداخت امن و تضمین کیفیت توسط تیم حرفه‌ای ما</span>
              </div>
            </motion.div>

          </div>
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
            <Link href="/shop" className="bg-primary-pink text-white px-8 py-3 rounded-full font-bold shadow-md hover:scale-105 transition-transform flex items-center gap-2">
              مشاهده فروشگاه
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </motion.div>
        )}

      </div>
    </div>
  );
}