"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { CheckCircle2, ShoppingBag, Gift, Sparkles, Baby, Palette } from "lucide-react";

export default function StoreProductsOverview() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      
      {/* المان‌های تزئینی پس‌زمینه */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-soft-blue/10 -skew-x-12 transform origin-top -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* سمت راست: محتوای متنی سئو شده (SEO Content) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col gap-6 text-right"
          >
            <div className="inline-flex items-center gap-2 bg-primary-pink/10 text-primary-pink px-4 py-2 rounded-full w-fit shadow-sm border border-primary-pink/20">
              <ShoppingBag className="w-4 h-4" />
              <h2 className="text-sm font-bold">خرید آنلاین زیباترین دست‌بافت‌ها</h2>
            </div>
            
            {/* تگ H2 به شدت برای سئو ارزشمند است */}
            <h2 className="text-3xl sm:text-4xl font-display text-text-dark leading-tight">
              در فروشگاه قلاب جادویی <br/>
              <span className="text-primary-pink">چه محصولاتی</span> خلق می‌شود؟
            </h2>
            
            <p className="text-gray-600 font-sans leading-relaxed text-justify">
              تیم حرفه‌ای هنرمندان ما با ترکیب هنر دست و بهترین الیاف ضدحساسیت، طیف گسترده‌ای از محصولات فانتزی را تولید می‌کنند. شما می‌توانید برای <strong>سفارش آنلاین</strong> و <strong>خرید فوری</strong> محصولات زیر، به صورت تک یا عمده روی ما حساب کنید:
            </p>

            {/* لیست سئو محور با کلمات کلیدی دقیق */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
              
              <div className="flex items-start gap-3">
                <div className="bg-soft-yellow p-2 rounded-xl shrink-0 mt-1">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-text-dark mb-1">دسته گل و باکس جاودان</h3>
                  <p className="text-sm text-gray-500 font-sans leading-relaxed">
                    خرید آنلاین دسته گل رز بافتنی، گل آفتابگردان، بابونه، باکس گل هدیه، گل‌های مینیاتوری و سبدهای گل کاموایی همیشه بهار.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary-pink/20 p-2 rounded-xl shrink-0 mt-1">
                  <Palette className="w-5 h-5 text-primary-pink" />
                </div>
                <div>
                  <h3 className="font-bold text-text-dark mb-1">عروسک‌های فانتزی</h3>
                  <p className="text-sm text-gray-500 font-sans leading-relaxed">
                    سفارش انواع عروسک آمیگورومی (Amigurumi)، خرس تدی دست‌ساز، عروسک‌های دخترانه لوکس و شخصیت‌های کارتونی بافتنی.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-mint-green p-2 rounded-xl shrink-0 mt-1">
                  <CheckCircle2 className="w-5 h-5 text-green-700" />
                </div>
                <div>
                  <h3 className="font-bold text-text-dark mb-1">دکوری و چیدمان منزل</h3>
                  <p className="text-sm text-gray-500 font-sans leading-relaxed">
                    خرید گلدان‌های تزئینی، ست کاکتوس‌های دوقلوی کاموایی، دیوارکوب‌های مکرومه، کوسن‌های فانتزی و دکوریجات میز کار.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-soft-blue p-2 rounded-xl shrink-0 mt-1">
                  <Baby className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-text-dark mb-1">ست سیسمونی و اکسسوری</h3>
                  <p className="text-sm text-gray-500 font-sans leading-relaxed">
                    خرید فوری لباس بافتنی نوزاد، پاپوش، پتوی دست‌بافت، دندان‌گیر آمیگورومی، به همراه کلاه و شال گردن‌های زمستانی.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="bg-purple-100 p-2 rounded-xl shrink-0 mt-1">
                  <Gift className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-text-dark mb-1">گیفت و یادگاری‌های خاص</h3>
                  <p className="text-sm text-gray-500 font-sans leading-relaxed">
                    سفارش اینترنتی و عمده گیفت‌های عروسی، یادگاری‌های تولد، جاکلیدی‌های کاموایی، مگنت یخچال و هدیه‌های سازمانی خاص.
                  </p>
                </div>
              </div>

            </div>

          </motion.div>

          {/* سمت چپ: تصویر اسپلیت (Split Image) */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-full min-h-[500px] lg:min-h-full rounded-[3rem] overflow-hidden shadow-2xl border-8 border-gray-50"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10 pointer-events-none"></div>
            
            {/* تصویر سئو شده */}
            <Image 
              src="/seo-products-banner.webp" 
              alt="خرید آنلاین انواع بافتنی، دسته گل جاودان و عروسک آمیگورومی" 
              fill 
              className="object-cover hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            
            <div className="absolute bottom-8 left-8 right-8 z-20 bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white">
              <div className="flex items-center gap-4">
                <div className="bg-mint-green/30 p-3 rounded-2xl">
                  <CheckCircle2 className="w-8 h-8 text-green-700" />
                </div>
                <div>
                  <p className="font-bold text-text-dark text-lg">تضمین کیفیت و اصالت</p>
                  <p className="text-sm text-gray-500 font-sans mt-1">ارسال سریع و مطمئن به سراسر ایران</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}