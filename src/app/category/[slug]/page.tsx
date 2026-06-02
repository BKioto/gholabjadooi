// مسیر فایل: src/app/category/[slug]/page.tsx

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Star, Image as ImageIcon } from "lucide-react";
import QuickAddToCartButton from "@/components/QuickAddToCartButton";

// 👈 ایمپورت کامپوننت جادویی سئو که ساختیم
import CategorySeoBox from "@/components/CategorySeoBox"; 

// دریافت لحظه‌ای اطلاعات از دیتابیس (سرور ساید - ضد تحریم و فیلتر)
export const dynamic = 'force-dynamic';

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  
  // رفع مشکل نسخه جدید Next.js
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // ۱. دریافت اطلاعات خود دسته‌بندی از دیتابیس در سمت سرور
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();

  // اگر دسته‌بندی پیدا نشد
  if (!category) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 text-center px-4">
        <h1 className="text-3xl font-bold text-text-dark mb-4">دسته‌بندی پیدا نشد!</h1>
        <Link href="/shop" className="text-primary-pink font-bold flex items-center gap-2">
          بازگشت به فروشگاه <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>
    );
  }

  // ۲. دریافت محصولات مرتبط با این دسته‌بندی
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_available', true);

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      
      {/* هدر دسته‌بندی با عکس جذاب */}
      <div className="relative bg-white border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover blur-2xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 flex flex-col items-center text-center">
          <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden mb-6 bg-soft-blue/20">
            <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-display text-text-dark mb-4">
            {category.name}
          </h1>
        </div>
      </div>

      {/* لیست محصولات */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-text-dark">محصولات این دسته</h2>
          <span className="text-gray-400 font-sans text-sm">{products?.length || 0} محصول پیدا شد</span>
        </div>

        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-3xl p-4 border-2 border-transparent hover:border-primary-pink/20 shadow-sm hover:shadow-xl transition-all group relative"
              >
                <Link href={`/shop/${product.slug}`}>
                  <div className="w-full aspect-square rounded-2xl bg-soft-blue/10 flex items-center justify-center mb-4 relative overflow-hidden cursor-pointer">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-soft-blue opacity-50 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <span className="text-xs font-bold text-text-dark mt-1">۵.۰</span>
                      <Star className="w-3 h-3 text-soft-yellow fill-soft-yellow" />
                    </div>
                  </div>
                </Link>

                <div className="text-right">
                  <Link href={`/shop/${product.slug}`}>
                    <h3 className="text-lg font-bold text-text-dark mb-1 truncate hover:text-primary-pink transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                    <div className="text-primary-pink font-bold flex gap-1 items-center">
                      <span>{product.price.toLocaleString("fa-IR")}</span>
                      <span className="text-xs text-text-dark/50">تومان</span>
                    </div>
                    
                    {/* فراخوانی دکمه هوشمند سبد خرید */}
                    <QuickAddToCartButton product={product} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl text-center shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-text-dark mb-2">هنوز محصولی اینجا نیست!</h3>
            <p className="text-gray-500 font-sans">تیم حرفه‌ای هنرمندان ما به زودی شاهکارهای جدیدی به این دسته اضافه خواهند کرد.</p>
          </div>
        )}
      </div>

      {/* 👈 اینم از ضربه نهایی: نمایش باکس سئو در پایین صفحه */}
      <CategorySeoBox slug={slug} />

    </div>
  );
}