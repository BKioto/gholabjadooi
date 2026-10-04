// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { landingMeta } from '@/data/landing/meta';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.gholabjadooi.ir';

  // ۱. مسیرهای استاتیک و اصلی سایت با تاریخ ثابت و اولویت‌بندی منطقی سئو
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: '', priority: 1, changeFrequency: 'daily' },
    { url: '/shop', priority: 0.9, changeFrequency: 'daily' },
    { url: '/about', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/faq', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/terms', priority: 0.4, changeFrequency: 'yearly' },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: new Date('2026-06-01'), // 👈 استفاده از تاریخ ثابت به جای زمان حال تا ربات‌ها سایت رو جریمه نکنن
    changeFrequency: route.changeFrequency as any,
    priority: route.priority,
  }));

  // ۱-ب. صفحه‌ی مادر «راهنمای خرید» و ۳۰ صفحه‌ی لندینگ سئو (با تاریخ ثابت؛ هر وقت محتوای صفحه‌ای را عوض کردید، تاریخش را هم عوض کنید)
  const guideRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/guides`, lastModified: new Date('2026-10-04'), changeFrequency: 'weekly', priority: 0.8 },
    ...landingMeta.map((m) => ({
      url: `${baseUrl}/${m.slug}`,
      lastModified: new Date('2026-10-04'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];

  // ۲. دریافت دسته‌بندی‌های واقعی از دیتابیس
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at');

  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: category.created_at ? new Date(category.created_at) : new Date('2026-06-01'),
    changeFrequency: 'weekly',
    priority: 0.8, // 👈 اولویت دسته‌بندی‌ها رو بالاتر از قبل بردیم
  }));

  // ۳. دریافت محصولات واقعی از دیتابیس
  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at')
    .eq('is_available', true);

  const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`, 
    lastModified: product.created_at ? new Date(product.created_at) : new Date('2026-06-01'),
    changeFrequency: 'weekly',
    priority: 0.7, // 👈 اولویت محصولات رو هم بالاتر بردیم
  }));

  // ترکیب تمام مسیرها و تولید خروجی برای گوگل
  return [...staticRoutes, ...guideRoutes, ...categoryRoutes, ...productRoutes];
}
