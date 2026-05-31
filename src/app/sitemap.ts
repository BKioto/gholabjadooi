// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://gholabjadooi.ir';

  // ۱. مسیرهای استاتیک و اصلی سایت
  const staticRoutes: MetadataRoute.Sitemap = [
    '',
    '/shop',
    '/about',
    '/faq',
    '/contact',
    '/terms',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    // اولویت صفحه اصلی ۱ و بقیه صفحات ۰.۸
    priority: route === '' ? 1 : 0.8,
  }));

  // ۲. دریافت دسته‌بندی‌های واقعی از دیتابیس
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at');

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    // اگر تاریخ آپدیت داشتیم اون رو میذاریم، وگرنه تاریخ ساخت یا زمان حال
    lastModified: category.created_at ? new Date(category.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7, // اولویت دسته‌بندی‌ها از محصولات بالاتر و از صفحات اصلی کمتر است
  }));

  // ۳. دریافت محصولات واقعی از دیتابیس (فقط اونایی که موجود هستن)
  const { data: products } = await supabase
    .from('products')
    .select('id, created_at')
    .eq('is_available', true);

  const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/shop/${product.id}`,
    lastModified: product.created_at ? new Date(product.created_at) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // ترکیب تمام مسیرها (استاتیک + دسته‌بندی‌ها + محصولات) و تولید خروجی برای گوگل
  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}