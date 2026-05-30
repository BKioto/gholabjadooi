import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import Categories from "@/components/Categories";
import BestSellers from "@/components/BestSellers"; 
import StoreProductsOverview from "@/components/StoreProductsOverview";
import { supabase } from "@/lib/supabase"; 

// دریافت لحظه‌ای اطلاعات از دیتابیس (سرور ساید - ضد تحریم و فیلتر)
export const dynamic = 'force-dynamic';

const jsonLd = {
  "@context": "https://schema.org",
  "@graphql": [
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

  // ۲. دریافت اطلاعات ۴ تا از پرفروش‌ترین (یا جدیدترین) محصولات
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_available', true)
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
      
      {/* دوم پرفروش‌ها برای نمایش سریع محصولات جذاب */}
      <BestSellers products={products || []} />
      
      {/* سوم درباره ما برای اعتمادسازیِ هنری بعد از دیدن محصولات */}
      <AboutSection />
      
      {/* متن سئو در پایین‌ترین بخش */}
      <StoreProductsOverview />
    </div>
  );
}