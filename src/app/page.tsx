// مسیر فایل: src/app/page.tsx
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import Categories from "@/components/Categories";
import BestSellers from "@/components/BestSellers"; 
import LatestProducts from "@/components/LatestProducts";
import FinishedCreationsShowcase from "@/components/FinishedCreationsShowcase"; // 👈 گالری پینترستی آخرین دست‌بافت‌های آماده شده
import StoreProductsOverview from "@/components/StoreProductsOverview";
import PopularSearches from "@/components/landing/PopularSearches";
import { supabase } from "@/lib/supabase"; 
import type { Metadata } from "next";

// دریافت لحظه‌ای اطلاعات از دیتابیس (سرور ساید - ضد تحریم و فیلتر)
export const dynamic = 'force-dynamic';

// 👈 canonical صفحه‌ی اصلی (بقیه‌ی متاها از layout می‌آید)
export const metadata: Metadata = { alternates: { canonical: "/" } };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.gholabjadooi.ir/#website",
      "url": "https://www.gholabjadooi.ir",
      "name": "قلاب جادویی",
      "description": "سفارش آنلاین بافتنی و دسته گل کاموایی فانتزی",
      "inLanguage": "fa-IR"
    },
    {
      "@type": "Organization",
      "@id": "https://www.gholabjadooi.ir/#organization",
      "name": "قلاب جادویی",
      "url": "https://www.gholabjadooi.ir",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.gholabjadooi.ir/logo.png",
        "caption": "لوگوی قلاب جادویی"
      },
      "description": "تیم حرفه‌ای از مجرب‌ترین و حرفه‌ای‌ترین هنرمندان بافنده دست‌سازه‌های فانتزی کلاف کاموا",
      "telephone": "+989924230576",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Ahvaz",
        "addressRegion": "Khuzestan",
        "addressCountry": "IR",
        "streetAddress": "کیان آباد"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+989924230576",
        "contactType": "customer service",
        "availableLanguage": "Persian"
      },
      "sameAs": [
        "https://ble.ir/gholabjadooi",
        "https://eitaa.com/gholabjadooi",
        "https://t.me/gholabjadooi"
      ]
    }
  ]
};

export default async function Home() {
  // ۱. دریافت اطلاعات دسته‌بندی‌ها
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: true });

  // ۲. دریافت اطلاعات ۴ تا از جدیدترین محصولات دیتابیس
  const { data: latestProducts } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(4);

  // ۳. دریافت اطلاعات ۴ تا از پرفروش‌ترین محصولات 
  const { data: bestSellerProducts } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_available', true)
    .order('created_at', { ascending: true }) 
    .limit(4);

  // ۴. دریافت لیست آخرین دست‌بافت‌های آماده شده برای نمایش پینترستی در پایین صفحه
  const { data: showcaseItems } = await supabase
    .from('showcase_items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(24);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      
      {/* اول دسته‌بندی‌ها برای هدایت سریع مشتری */}
      <Categories categories={categories || []} />

      {/* دوم جدیدترین محصولات برای القای حس پویایی فروشگاه */}
      <LatestProducts products={latestProducts || []} />
      
      {/* سوم پرفروش‌ها برای نمایش سریع محصولات جذاب و پرطرفدار */}
      <BestSellers products={bestSellerProducts || []} />
      
      {/* چهارم درباره ما برای اعتمادسازیِ هنری بعد از دیدن محصولات */}
      <AboutSection />

      {/* پنجم گالری پینترستی آخرین دست‌بافت‌های آماده شده در پایین صفحه */}
      <FinishedCreationsShowcase items={showcaseItems || []} />
      
      {/* متن سئو در پایین‌ترین بخش */}
      <StoreProductsOverview />

      {/* راهنمای خرید: لینک به همه‌ی صفحات لندینگ */}
      <PopularSearches />
    </div>
  );
}