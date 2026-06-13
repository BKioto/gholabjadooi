// مسیر فایل: src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StoreStatusBanner from "@/components/StoreStatusBanner";
import AnalyticsTracker from "@/components/AnalyticsTracker"; // 👈 کامپوننت آمارگیر اضافه شد
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.gholabjadooi.ir'),
  title: {
    template: "%s | قلاب جادویی", 
    default: "فروشگاه قلاب جادویی | خرید آنلاین دست‌بافت‌های فانتزی و عروسک کاموایی", 
  },
  description: "سفارش و خرید آنلاین زیباترین دست‌بافت‌های فانتزی، دسته گل جاودان، عروسک‌های آمیگورومی و دکوری‌های کاموایی. خلق شده توسط یک تیم حرفه‌ای از هنرمندان با تضمین کیفیت و ارسال سریع.",
  keywords: [
    "خرید بافتنی", 
    "عروسک آمیگورومی", 
    "دسته گل کاموایی", 
    "خرید هدیه خاص", 
    "قلاب جادویی", 
    "خرید آنلاین کادو", 
    "دکوری فانتزی",
    "گیفت دست‌ساز"
  ],
  openGraph: {
    title: "فروشگاه قلاب جادویی | دنیای فانتزی دست‌بافت‌ها",
    description: "زیباترین عروسک‌های کاموایی و باکس‌های گل جادویی که توسط یک تیم حرفه‌ای برای شما بافته شده‌اند. هدیه‌ای بی‌نظیر که هرگز پژمرده نمی‌شود!",
    url: "https://www.gholabjadooi.ir",
    siteName: "قلاب جادویی",
    images: [
      {
        url: "/seo-products-banner.webp", 
        width: 1200,
        height: 630,
        alt: "محصولات فروشگاه قلاب جادویی",
      },
    ],
    locale: "fa_IR",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // خواندن وضعیت باز/بسته بودن فروشگاه از دیتابیس
  const { data: settings } = await supabase
    .from('store_settings')
    .select('is_open')
    .eq('id', 1)
    .single();

  const isStoreOpen = settings?.is_open ?? true;

  return (
    <html lang="fa" dir="rtl">
      <body className="font-sans antialiased bg-soft-blue text-text-dark">
        
        {/* ردیاب آمار زنده - کاملاً نامرئی */}
        <AnalyticsTracker />

        {/* بنر هوشمند وضعیت فروشگاه */}
        <StoreStatusBanner isOpen={isStoreOpen} />

        {/* نوبار هوشمند */}
        <Navbar />
        
        {/* محتوای متغیر هر صفحه */}
        <main className="min-h-screen">
          {children}
        </main>
        
        <Footer />
      </body>
    </html>
  );
}