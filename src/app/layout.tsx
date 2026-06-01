import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// 🪄 تنظیمات پرفکت و جامع سئو برای کل فروشگاه
export const metadata: Metadata = {
  metadataBase: new URL('https://www.gholabjadooi.ir'), // 👈 اضافه شدن آدرس پایه برای جلوگیری از ارورهای گوگل
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className="font-sans antialiased bg-soft-blue text-text-dark">
        {/* نوبار هوشمندی که ساختیم */}
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