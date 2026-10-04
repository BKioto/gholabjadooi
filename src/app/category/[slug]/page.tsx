// مسیر فایل: src/app/category/[slug]/page.tsx

import { supabase } from "@/lib/supabase";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absUrl, ldJson } from "@/lib/seo";
import { getCategoryMeta } from "@/data/seo/category-meta";
import Link from "next/link";
import { ArrowLeft, Star, Image as ImageIcon } from "lucide-react";
import QuickAddToCartButton from "@/components/QuickAddToCartButton";

// 👈 ایمپورت کامپوننت جادویی سئو که ساختیم
import CategorySeoBox from "@/components/CategorySeoBox"; 

// 👈 لینک‌دهی داخلی به صفحات لندینگ سئو
import RelatedGuides from "@/components/landing/RelatedGuides";
import { guidesByCategory } from "@/data/landing/meta";

// دریافت لحظه‌ای اطلاعات از دیتابیس (سرور ساید - ضد تحریم و فیلتر)
export const dynamic = 'force-dynamic';

// 🪄 سئو: عنوان، توضیحات، canonical و تصویر اشتراک‌گذاری اختصاصی برای هر دسته‌بندی
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: category } = await supabase.from('categories').select('name, image').eq('slug', slug).single();
  if (!category) return { title: 'دسته‌بندی پیدا نشد', robots: { index: false, follow: false } };

  const m = getCategoryMeta(slug, category.name);
  const image = absUrl(category.image);
  const ogImages = image ? [{ url: image, alt: category.name }] : [DEFAULT_OG_IMAGE];
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: `/category/${slug}` },
    openGraph: { type: 'website', locale: 'fa_IR', siteName: SITE_NAME, url: `/category/${slug}`, title: m.title, description: m.description, images: ogImages },
    twitter: { card: 'summary_large_image', title: m.title, description: m.description, images: [image ?? DEFAULT_OG_IMAGE.url] },
  };
}

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

  // اگر دسته‌بندی پیدا نشد → ۴۰۴ واقعی (نه صفحه‌ی ۲۰۰ خالی = soft-404)
  if (!category) notFound();

  // ۲. دریافت محصولات مرتبط با این دسته‌بندی
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .eq('is_available', true);

  // 👈 داده‌ی ساختاریافته: صفحه‌ی مجموعه + مسیر ناوبری + فهرست محصولات
  const catUrl = `${SITE_URL}/category/${slug}`;
  const catMeta = getCategoryMeta(slug, category.name);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage", "@id": `${catUrl}#webpage`, url: catUrl, name: catMeta.title, description: catMeta.description,
        inLanguage: "fa-IR", isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL }, breadcrumb: { "@id": `${catUrl}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList", "@id": `${catUrl}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "فروشگاه", item: `${SITE_URL}/shop` },
          { "@type": "ListItem", position: 3, name: category.name, item: catUrl },
        ],
      },
      {
        "@type": "ItemList", name: category.name,
        itemListElement: (products ?? []).map((p: { slug: string; title: string }, i: number) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/shop/${p.slug}`, name: p.title })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
      
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

      {/* 👈 لینک به راهنماهای خرید مرتبط با این دسته (صفحات لندینگ سئو) */}
      <RelatedGuides slugs={guidesByCategory[slug] ?? []} />

      {/* 👈 اینم از ضربه نهایی: نمایش باکس سئو در پایین صفحه */}
      <CategorySeoBox slug={slug} />

    </div>
  );
}
