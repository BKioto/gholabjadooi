import { supabase } from "@/lib/supabase";
import ShopClient from "@/components/ShopClient";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(
  "/shop",
  "فروشگاه بافتنی دست‌ساز؛ عروسک، دسته گل و اکسسوری",
  "فروشگاه آنلاین قلاب جادویی: عروسک آمیگورومی، دسته گل بافتنی، کیف، کلاه، جاکلیدی و دکوری کاموایی دست‌ساز با ارسال به سراسر ایران و امکان سفارش اختصاصی."
);

// دریافت لحظه‌ای اطلاعات از دیتابیس (سرور ساید - ضد تحریم و فیلتر)
export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  // ۱. دریافت لیست تمام دسته‌بندی‌ها از دیتابیس
  const { data: categories } = await supabase.from('categories').select('*');

  // ۲. دریافت لیست تمام محصولات موجود به همراه نام دسته‌بندیشون (مرتب‌سازی بر اساس جدیدترین‌ها به طور پیش‌فرض)
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* هدر مخصوص صفحه فروشگاه (کاملاً سروری و استاتیک برای لود سریع) */}
      <div className="bg-white border-b border-gray-100 pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-display text-text-dark mb-4">
            فروشگاه <span className="text-primary-pink">قلاب جادویی</span>
          </h1>
   
          <p className="text-lg font-sans text-text-dark/70 max-w-2xl mx-auto">
            زیباترین دست‌بافت‌های تیم حرفه‌ای ما رو اینجا کشف کنید. هر محصول داستانی از هنر و عشق است.
          </p>
        </div>
      </div>

      {/* فراخوانی کامپوننت کلاینت و پاس دادن دیتای واقعی به آن */}
      <ShopClient initialProducts={products || []} initialCategories={categories || []} />
      
    </div>
  );
}
