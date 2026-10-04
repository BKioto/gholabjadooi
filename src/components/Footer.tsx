// مسیر فایل: src/components/Footer.tsx
"use client";

import Link from "next/link";
import { chipOf } from "@/data/landing/meta";

// 👈 مهم‌ترین صفحات لندینگ سئو برای لینک‌دهی از فوتر همه‌ی صفحات سایت
const footerGuides = [
  "buy-crochet-bouquet", "buy-amigurumi-doll", "buy-crochet-girls-accessories", "buy-crochet-bag",
  "buy-crochet-bucket-hat", "buy-crochet-home-decor", "buy-handmade-gift", "buy-crochet-baby-set",
  "custom-crochet-doll-from-photo", "wholesale-crochet-gifts", "crochet-handmade-price-list", "crochet-shipping-all-iran",
];
import { Phone, Code2, ShoppingBag, Info, HelpCircle } from "lucide-react";

export default function Footer() {
  // دریافت سال جاری خورشیدی
  const currentYear = new Date().toLocaleDateString('fa-IR', { year: 'numeric' });

  return (
    <footer className="bg-white border-t border-gray-100 relative overflow-hidden mt-auto">
      {/* هاله‌های نوری پس‌زمینه برای دیزاین پرمیوم */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-pink/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-mint-green/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* ستون اول: درباره برند و پشتیبانی */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group w-fit">
                <div className="rounded-2xl group-hover:shadow-md transition-all overflow-hidden w-12 h-12 border border-gray-100 shrink-0 bg-white">
                  <img src="/logo.png" alt="لوگوی قلاب جادویی" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="font-display text-3xl text-primary-pink font-bold">قلاب جادویی</span>
              </Link>

              {/* ⚠️ اصلاح مهم: لینک «Partners & Projects» که اینجا بود حذف شد.
                  دلیل: بخشی از یک شبکه‌ی لینک‌سازیِ متقابل بین چند سایت هم‌مالک
                  بود که طبق دستورالعمل رسمی گوگل (Link Schemes) ریسک افت رتبه
                  یا نادیده‌گرفتن کل شبکه توسط گوگل را داشت. صفحه‌ی
                  src/app/partners هم باید کامل حذف شود؛ یک ریدایرکت ۳۰۱ در
                  next.config.ts جایگزینش شده تا کسی به خطای ۴۰۴ نخورد. */}
            </div>
            
            {/* متن سئو شده برای معرفی خدمات قلاب‌بافی */}
            <p className="text-gray-500 font-sans leading-relaxed text-sm text-justify">
              فروشگاه تخصصی قلاب‌بافی و دست‌بافت‌های فانتزی. ما با ترکیب هنر و بهترین الیاف ضدحساسیت، انواع عروسک‌های آمیگورومی (Amigurumi)، دسته گل‌های کاموایی جاودان و دکوریجات خاص را طراحی و تولید می‌کنیم. خرید مستقیم و بی‌واسطه از تیم هنرمندان.
            </p>
            
            {/* شماره تماس پشتیبانی */}
            <div className="flex items-center gap-3 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100 w-fit">
              <Phone className="w-5 h-5 text-soft-blue shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold">تلفن پشتیبانی</span>
                <span className="font-sans font-bold text-text-dark text-sm" dir="ltr">0992 423 0576</span>
              </div>
            </div>
          </div>

          {/* ستون دوم: شبکه‌های اجتماعی و پیام‌رسان‌ها */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-xl text-text-dark relative w-fit">
              پشتیبانی آنلاین
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-primary-pink rounded-full"></span>
            </h3>
            <p className="text-sm text-gray-500 font-sans">
              سریع‌ترین راه برای پیگیری سفارشات، ارتباط با ما در پیام‌رسان‌های داخلی و خارجی است.
            </p>
            
            <div className="flex flex-wrap gap-4 mt-2">
              {/* لینک بله */}
              <a href="https://ble.ir/gholabjadooi" target="_blank" rel="noopener noreferrer" className="group">
                <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center justify-center hover:-translate-y-2 hover:shadow-lg transition-all duration-300 w-14 h-14">
                  <img src="/bale-logo.webp" alt="بله" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
              </a>

              {/* لینک ایتا */}
              <a href="https://eitaa.com/gholabjadooi" target="_blank" rel="noopener noreferrer" className="group">
                <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center justify-center hover:-translate-y-2 hover:shadow-lg transition-all duration-300 w-14 h-14">
                  <img src="/eitaa-logo.webp" alt="ایتا" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
              </a>

              {/* لینک تلگرام */}
              <a href="https://t.me/gholabjadooi" target="_blank" rel="noopener noreferrer" className="group">
                <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center justify-center hover:-translate-y-2 hover:shadow-lg transition-all duration-300 w-14 h-14">
                  <img src="/telegram_icon.webp" alt="تلگرام" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
              </a>

              {/* لینک واتساپ */}
              <a href="https://wa.me/989924230576" target="_blank" rel="noopener noreferrer" className="group">
                <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-2xl flex items-center justify-center hover:-translate-y-2 hover:shadow-lg transition-all duration-300 w-14 h-14">
                  <img src="/whatsapp_icon.webp" alt="واتساپ" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                </div>
              </a>
            </div>
          </div>

          {/* ستون سوم: دسترسی سریع (کاملاً تمیز و بدون لینک اضافی) */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-xl text-text-dark relative w-fit">
              دسترسی سریع
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-primary-pink rounded-full"></span>
            </h3>
            <ul className="space-y-3 text-sm text-gray-500 font-medium font-sans">
              <li>
                <Link href="/shop" className="hover:text-primary-pink transition-all flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> فروشگاه محصولات
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary-pink transition-all flex items-center gap-2">
                  <Info className="h-4 w-4" /> درباره تیم ما
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-primary-pink transition-all flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" /> سوالات متداول
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-pink transition-all flex items-center gap-2">
                  <Phone className="h-4 w-4" /> تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* ستون چهارم: نمادهای اعتماد با تصاویر واقعی */}
          <div className="flex flex-col gap-6">
            <h3 className="font-bold text-xl text-text-dark relative w-fit">
              نمادهای اعتماد
              <span className="absolute -bottom-2 right-0 w-1/2 h-1 bg-primary-pink rounded-full"></span>
            </h3>
            <p className="text-sm text-gray-500 font-sans">خرید امن و مطمئن زیر نظر مراجع قانونی.</p>
            
            <div className="flex gap-4 mt-2">
              {/* تصویر اینماد */}
              <div className="bg-white border-2 border-gray-100 p-2 rounded-2xl shadow-sm flex items-center justify-center w-24 h-24 hover:border-primary-pink/30 hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                <img src="/enamad.webp" alt="نماد اعتماد الکترونیکی" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
              </div>
              
              {/* تصویر ساماندهی */}
              <div className="bg-white border-2 border-gray-100 p-2 rounded-2xl shadow-sm flex items-center justify-center w-24 h-24 hover:border-soft-blue/50 hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                <img src="/samandehi.webp" alt="نشان ملی ثبت رسانه‌های دیجیتال" className="w-full h-full object-contain group-hover:scale-105 transition-transform" />
              </div>
            </div>
          </div>

        </div>

        {/* --- راهنمای خرید (لینک‌دهی داخلی به صفحات لندینگ سئو) --- */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h3 className="font-bold text-lg text-text-dark mb-4">راهنمای خرید بافتنی دست‌ساز</h3>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-500 font-sans">
            {footerGuides.map((s) => (
              <Link key={s} href={`/${s}`} className="hover:text-primary-pink transition-colors">{chipOf(s)}</Link>
            ))}
            <Link href="/guides" className="text-primary-pink font-bold hover:underline">همه‌ی راهنماهای خرید ←</Link>
          </div>
        </div>

        {/* --- نوار پایین فوتر (Bottom Bar) --- */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col lg:flex-row justify-between items-center gap-6">
          
          {/* کپی‌رایت */}
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-400 font-sans">
              تمامی حقوق محفوظ است © {currentYear}
            </p>
          </div>
          
          {/* --- امضای کیا دِو (KiyaDev Signature) --- */}
          <a 
            href="https://kiyadev.ir" 
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 bg-gray-50 hover:bg-slate-900 border border-gray-100 px-4 py-2 rounded-xl transition-all duration-300"
          >
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-gray-400 font-medium group-hover:text-gray-400/80">
                طراحی و مهندسی توسط
              </span>
              <span className="text-xs font-bold text-gray-700 group-hover:text-white flex items-center gap-1">
                KiyaDev Team
                <Code2 className="h-3 w-3 text-primary-pink group-hover:text-pink-400" />
              </span>
            </div>
            
            <div className="h-8 w-8 bg-white group-hover:bg-white/10 rounded-lg flex items-center justify-center shadow-sm transition-colors">
               <Code2 className="h-4 w-4 text-gray-600 group-hover:text-white" />
            </div>
          </a>
          {/* -------------------------------------- */}

        </div>
      </div>
    </footer>
  );
}
