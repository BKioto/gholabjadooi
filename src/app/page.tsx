import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import Categories from "@/components/Categories";
import BestSellers from "@/components/BestSellers"; 
import LatestProducts from "@/components/LatestProducts"; // 👈 کامپوننت جدید اضافه‌شد
import StoreProductsOverview from "@/components/StoreProductsOverview";
import { supabase } from "@/lib/supabase"; 

// دریافت لحظه‌ای اطلاعات از دیتابیس (سرور ساید - ضد تحریم و فیلتر)
export const dynamic = 'force-dynamic';

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://gholabjadooi.ir/#website",
      "url": "https://gholabjadooi.ir",
      "name": "قلاب جادویی",
      "description": "سفارش آنلاین بافتنی و دسته گل کاموایی فانتزی",
      "inLanguage": "fa-IR"
    },
    {
      "@type": "Organization",
      "@id": "https://gholabjadooi.ir/#organization",
      "name": "قلاب جادویی",
      "url": "https://gholabjadooi.ir",
      "logo": {
        "@type": "ImageObject",
        "url": "https://gholabjadooi.ir/logo.png",
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
        "https://ble.ir/gholabjadooi"
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

  // ۲. دریافت اطلاعات ۴ تا از جدیدترین محصولات دیتابیس 👈 کوئری جدید
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
    // برای پرفروش‌ها فعلا به صورت صعودی (قدیمی‌ترها) می‌گیریم تا با جدیدترین‌ها فرق کنه
    .order('created_at', { ascending: true }) 
    .limit(4);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      
      {/* اول دسته‌بندی‌ها برای هدایت سریع مشتری */}
      <Categories categories={categories || []} />

      {/* دوم جدیدترین محصولات برای القای حس پویایی فروشگاه 👈 بخش جدید */}
      <LatestProducts products={latestProducts || []} />
      
      {/* سوم پرفروش‌ها برای نمایش سریع محصولات جذاب و پرطرفدار */}
      <BestSellers products={bestSellerProducts || []} />
      
      {/* چهارم درباره ما برای اعتمادسازیِ هنری بعد از دیدن محصولات */}
      <AboutSection />
      
      {/* متن سئو در پایین‌ترین بخش */}
      <StoreProductsOverview />
    </div>
  );
}