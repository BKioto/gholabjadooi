// مسیر فایل: src/app/shop/[slug]/page.tsx

import { supabase } from "@/lib/supabase";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import RelatedGuides from "@/components/landing/RelatedGuides";
import { guidesForProduct } from "@/data/landing/meta";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL, absUrl, ldJson, plainText, tomanToRial, truncate } from "@/lib/seo";

export const dynamic = 'force-dynamic';

// 🪄 جادوی سئو: عنوان، توضیحات، کلمات کلیدی و تصویر اشتراک‌گذاری اختصاصی برای هر محصول (از فیلدهای سئوی دیتابیس)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const { data: product } = await supabase
    .from('products')
    .select('title, description, images, meta_title, meta_description, seo_keywords')
    .eq('slug', slug)
    .single();

  if (!product) {
    return { title: 'محصول پیدا نشد', robots: { index: false, follow: false } };
  }

  const rawTitle: string = (product.meta_title || '').trim() || `خرید ${product.title}`;
  // اگر نام برند از قبل در عنوان هست یا عنوان بلند می‌شود، بدون پسوند برند (جلوگیری از تکرار برند)
  const title = rawTitle.includes(SITE_NAME) || rawTitle.length + SITE_NAME.length + 3 > 70 ? { absolute: rawTitle } : rawTitle;

  const description: string =
    (product.meta_description || '').trim() ||
    truncate(plainText(product.description), 155) ||
    `سفارش آنلاین ${product.title} با تضمین کیفیت توسط تیم حرفه‌ای هنرمندان ما. ارسال به سراسر ایران.`;

  const image = absUrl(Array.isArray(product.images) ? product.images[0] : undefined);
  const keywords = String(product.seo_keywords || '').split(/[,،]/).map((k) => k.trim()).filter(Boolean);
  const ogImages = image ? [{ url: image, alt: product.title }] : [DEFAULT_OG_IMAGE];

  return {
    title,
    description,
    ...(keywords.length ? { keywords } : {}),
    alternates: { canonical: `/shop/${slug}` },
    openGraph: { type: 'website', locale: 'fa_IR', siteName: SITE_NAME, url: `/shop/${slug}`, title: rawTitle, description, images: ogImages },
    twitter: { card: 'summary_large_image', title: rawTitle, description, images: [image ?? DEFAULT_OG_IMAGE.url] },
  };
}

export default async function ProductDetails({ params }: { params: Promise<{ slug: string }> }) {
  // رفع مشکل نسخه جدید Next.js
  const resolvedParams = await params;
  const productSlug = resolvedParams.slug;

  // 👈 دریافت وضعیت فروشگاه از دیتابیس سوپابیس
  const { data: settings } = await supabase
    .from('store_settings')
    .select('is_open')
    .eq('id', 1)
    .single();

  // اگر به هر دلیلی دیتابیس جواب نداد، پیش‌فرض فروشگاه باز باشه
  const isStoreOpen = settings?.is_open ?? true;

  // دریافت اطلاعات محصول
  const { data: product } = await supabase
    .from('products')
    .select('*, categories(name, slug)')
    .eq('slug', productSlug)
    .single();

  // 👈 اگر محصول نبود، ۴۰۴ واقعی برگردان (نه صفحه‌ی ۲۰۰ خالی = soft-404)
  if (!product) notFound();

  const category = Array.isArray(product.categories) ? product.categories[0] : product.categories;
  const url = `${SITE_URL}/shop/${product.slug}`;
  const images = (Array.isArray(product.images) ? product.images : []).map((i: string) => absUrl(i)).filter(Boolean) as string[];
  const basePrice = Number(product.price) || 0;
  const disc = Number(product.discount_price) || 0;
  const price = disc > 0 && disc < basePrice ? disc : basePrice;
  const inStock = Boolean(product.is_available) && (product.stock == null || Number(product.stock) > 0);
  const description = truncate(plainText(product.description), 4900);

  // 👈 داده‌ی ساختاریافته‌ی محصول (Product + Offer) و مسیر ناوبری (BreadcrumbList) برای نمایش قیمت و موجودی در گوگل
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${url}#product`,
        name: product.title,
        url,
        ...(description ? { description } : {}),
        ...(images.length ? { image: images } : {}),
        sku: String(product.slug),
        brand: { "@type": "Brand", name: SITE_NAME },
        ...(category?.name ? { category: category.name } : {}),
        ...(price > 0
          ? {
              offers: {
                "@type": "Offer",
                url,
                priceCurrency: "IRR", // قیمت‌های سایت به تومان است؛ اینجا ریال (×۱۰) ثبت می‌شود
                price: String(tomanToRial(price)),
                availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                itemCondition: "https://schema.org/NewCondition",
                seller: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
              },
            }
          : {}),
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "خانه", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "فروشگاه", item: `${SITE_URL}/shop` },
          ...(category?.slug && category?.name
            ? [{ "@type": "ListItem", position: 3, name: category.name, item: `${SITE_URL}/category/${category.slug}` }]
            : []),
          { "@type": "ListItem", position: category?.slug && category?.name ? 4 : 3, name: product.title, item: url },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />

      {/* 👈 پاس دادن وضعیت فروشگاه به کامپوننت دکمه‌ها */}
      <ProductDetailsClient product={product} isStoreOpen={isStoreOpen} />

      {/* 👈 لینک‌دهی داخلی از محصول به صفحات لندینگ سئوی مرتبط */}
      <RelatedGuides slugs={guidesForProduct(`${product.title} ${product.seo_keywords ?? ""}`, category?.slug)} />
    </div>
  );
}
