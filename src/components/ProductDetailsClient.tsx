"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Star, ShieldCheck, Truck, Clock, Minus, Plus, Image as ImageIcon, CheckCircle2, Check, Ruler, Sparkles, ZoomIn, X } from "lucide-react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

export default function ProductDetailsClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [mainImage, setMainImage] = useState(product.images && product.images.length > 0 ? product.images[0] : "");
  
  // State جدید برای باز و بسته شدن گالری تمام‌صفحه
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const addToCart = useCartStore((state) => state.addToCart);

  const increase = () => setQuantity(prev => prev + 1);
  const decrease = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images && product.images.length > 0 ? product.images[0] : "",
      quantity: quantity,
    });
    
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const productSize = product.attributes?.size || "سایز استاندارد";
  const prepTime = product.attributes?.prep_time || "۲ الی ۳ روز کاری";

  // جلوگیری از اسکرول صفحه وقتی گالری تمام‌صفحه باز است
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isFullscreen]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* مسیر راهنما */}
        <div className="text-sm font-sans text-gray-400 mb-8 flex gap-2">
          <Link href="/shop" className="hover:text-primary-pink transition-colors">فروشگاه</Link>
          <span>/</span>
          {product.categories && (
            <>
              <Link href={`/category/${product.categories.slug}`} className="hover:text-primary-pink transition-colors">
                {product.categories.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-primary-pink font-bold">{product.title}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
          
          {/* بخش گالری عکس */}
          <div className="flex flex-col gap-4">
            
            {/* باکس عکس اصلی (قابل کلیک برای بزرگنمایی) */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setIsFullscreen(true)}
              className="w-full aspect-square rounded-[3rem] bg-soft-blue/10 flex items-center justify-center relative border-4 border-gray-50 shadow-sm overflow-hidden group cursor-zoom-in"
            >
              <AnimatePresence mode="wait">
                {mainImage ? (
                  <motion.img 
                    key={mainImage}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    src={mainImage} 
                    alt={product.title} 
                    className="object-cover w-full h-full" 
                  />
                ) : (
                  <ImageIcon className="w-32 h-32 text-soft-blue opacity-50" />
                )}
              </AnimatePresence>

              {/* آیکون ذره‌بین که با رفتن موس روی عکس ظاهر می‌شود */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center z-20">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 shadow-lg flex items-center gap-2">
                  <ZoomIn className="w-6 h-6 text-text-dark" />
                  <span className="text-sm font-bold text-text-dark font-sans hidden sm:block">بزرگنمایی</span>
                </div>
              </div>
              
              {/* بج کیفیت */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-gray-100 z-10">
                <CheckCircle2 className="w-5 h-5 text-mint-green" />
                <span className="text-sm font-bold text-text-dark font-sans">تضمین کیفیت تیم ما</span>
              </div>
            </motion.div>

            {/* ردیف عکس‌های کوچک در صفحه اصلی */}
            {product.images && product.images.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              >
                {product.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`w-20 h-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                      mainImage === img 
                        ? "border-primary-pink shadow-md scale-105" 
                        : "border-gray-100 hover:border-primary-pink/50 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`${product.title} - تصویر ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </motion.div>
            )}
            
          </div>

          {/* اطلاعات و خرید */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-6 text-right"
          >
            <div className="flex items-center gap-2">
              <div className="flex text-soft-yellow">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-soft-yellow" />)}
              </div>
              <span className="text-sm font-sans text-gray-400">(امتیاز ۵.۰ از خریداران)</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-display text-text-dark leading-tight">
              {product.title}
            </h1>
            
            <div className="text-3xl font-bold text-primary-pink flex items-center gap-2">
              {product.price.toLocaleString("fa-IR")}
              <span className="text-lg text-gray-400 font-normal">تومان</span>
            </div>

            {/* باکس ویژگی‌ها */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col gap-3 mt-2">
              <div className="flex items-center gap-3">
                <Ruler className="w-5 h-5 text-primary-pink" />
                <span className="font-bold text-text-dark text-sm">سایز حدودی: </span>
                <span className="text-sm font-sans text-text-dark/80">{productSize}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-soft-blue" />
                <span className="font-bold text-text-dark text-sm">زمان آماده‌سازی: </span>
                <span className="text-sm font-sans text-text-dark/80">{prepTime}</span>
              </div>
            </div>

            {/* یادداشت بولد برای ارزش‌گذاری به کارهای دست‌بافت */}
            <div className="bg-red-50/60 border border-red-100 text-red-500 rounded-2xl p-4 flex items-start gap-3 font-sans text-sm font-bold leading-relaxed shadow-sm">
              <Sparkles className="w-5 h-5 shrink-0 mt-0.5 text-red-400 animate-pulse" />
              <p>
                اصالت دست‌سازه: از آنجا که هر محصول گره‌به‌گره و کاملاً با دست بافته می‌شود، وجود تفاوت‌های ظریف با عکس سایت طبیعی است. این ویژگی باعث می‌شود محصولی که به دستتان می‌رسد، نسخه‌ای اختصاصی و کاملاً منحصربه‌فرد برای شما باشد.
              </p>
            </div>

            <p className="text-lg text-text-dark/70 font-sans leading-relaxed text-justify mt-2">
              {product.description || "توضیحاتی برای این محصول ثبت نشده است."}
            </p>

            {/* دکمه‌های خرید */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-2xl p-2 w-full sm:w-32">
                <button onClick={decrease} className="p-2 text-gray-500 hover:text-primary-pink transition-colors cursor-pointer">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="font-bold text-xl font-sans w-8 text-center">{quantity}</span>
                <button onClick={increase} className="p-2 text-gray-500 hover:text-primary-pink transition-colors cursor-pointer">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg transition-all cursor-pointer ${
                  isAdded ? "bg-mint-green text-white shadow-md" : "bg-primary-pink text-white hover:shadow-lg"
                }`}
              >
                {isAdded ? (
                  <><Check className="w-6 h-6" /> به سبد خرید اضافه شد</>
                ) : (
                  <><ShoppingBag className="w-6 h-6" /> افزودن به سبد خرید</>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* مودال گالری تمام‌صفحه (Lightbox) */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8"
            onClick={() => setIsFullscreen(false)} // بستن با کلیک روی پس‌زمینه
          >
            {/* دکمه بستن خفن */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-red-500/80 rounded-full text-white transition-all z-50 shadow-lg backdrop-blur-md"
            >
              <X className="w-8 h-8" />
            </button>

            {/* عکس بزرگنمایی شده */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()} // جلوگیری از بسته شدن با کلیک روی خود عکس
              className="relative w-full max-w-5xl h-[70vh] sm:h-[80vh] flex items-center justify-center"
            >
               <img src={mainImage} alt={product.title} className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-2xl" />
            </motion.div>

            {/* گالری تصاویر کوچک داخل مودال برای دسترسی سریع کاربر */}
            {product.images && product.images.length > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 p-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20"
              >
                {product.images.map((img: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`w-16 h-16 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                      mainImage === img ? "border-primary-pink scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    <img src={img} alt={`تصویر ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}