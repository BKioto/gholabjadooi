// مسیر فایل: src/app/shop/[slug]/page.tsx

import { supabase } from "@/lib/supabase";
import ProductDetailsClient from "@/components/ProductDetailsClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

// 🪄 جادوی سئو: ساخت تایتل و توضیحات متغیر برای هر محصول
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  
  const { data: product } = await supabase
    .from('products')
    .select('title, description, images')
    .eq('slug', resolvedParams.slug) // 👈 جستجو با اسلاگ
    .single();

  if (!product) {
    return {
      title: 'محصول پیدا شد | فروشگاه قلاب جادویی',
    };
  }

  return {
    title: `خرید آنلاین ${product.title} | قلاب جادویی`,
    description: product.description ? product.description.substring(0, 150) + '...' : `سفارش آنلاین ${product.title} با تضمین کیفیت توسط تیم حرفه‌ای هنرمندان ما. ارسال به سراسر ایران.`,
    openGraph: {
      title: `خرید ${product.title}`,
      description: product.description || '',
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    }
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

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 px-4 text-center">
        <h1 className="text-3xl font-bold text-text-dark mb-4">محصول مورد نظر پیدا نشد!</h1>
        <p className="text-gray-500 font-sans mb-6">ممکن است این اثر هنری از فروشگاه حذف شده باشد.</p>
        <Link href="/shop" className="bg-primary-pink text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all">
          <ArrowLeft className="w-5 h-5" /> بازگشت به فروشگاه
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      {/* 👈 پاس دادن وضعیت فروشگاه به کامپوننت دکمه‌ها */}
      <ProductDetailsClient product={product} isStoreOpen={isStoreOpen} />
    </div>
  );
}