// src/app/sitemap.ts
import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';
import { landingMeta } from '@/data/landing/meta';
import { landingPages } from '@/data/landing/pages';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.gholabjadooi.ir';
  const FALLBACK_DATE = new Date('2026-06-01'); // تاریخ ثابت برای صفحاتی که محتوایشان کم عوض می‌شود (به‌جای «زمان حال»)

  // ۱. دسته‌بندی‌ها و محصولات واقعی از دیتابیس
  const { data: categories } = await supabase
    .from('categories')
    .select('id, slug, created_at');

  const { data: products } = await supabase
    .from('products')
    .select('slug, created_at, category_id')
    .eq('is_available', true);

  // تاریخ تازه‌ترین محصول (کلی و برای هر دسته): با اضافه‌شدن محصول جدید، خانه، فروشگاه و دسته‌ی مربوط «تازه» دیده می‌شوند
  let latestAll = 0;
  const latestByCategory = new Map<string, number>();
  for (const product of products || []) {
    const time = product.created_at ? new Date(product.created_at).getTime() : 0;
    if (time > latestAll) latestAll = time;
    if (product.category_id !== null && product.category_id !== undefined) {
      const key = String(product.category_id);
      if (time > (latestByCategory.get(key) ?? 0)) latestByCategory.set(key, time);
    }
  }
  const latestAllDate = latestAll ? new Date(latestAll) : FALLBACK_DATE;

  // ۲. مسیرهای اصلی سایت با اولویت‌بندی منطقی سئو
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: '', priority: 1, changeFrequency: 'daily', modified: latestAllDate },
    { url: '/shop', priority: 0.9, changeFrequency: 'daily', modified: latestAllDate },
    { url: '/about', priority: 0.7, changeFrequency: 'monthly', modified: FALLBACK_DATE },
    { url: '/faq', priority: 0.7, changeFrequency: 'monthly', modified: FALLBACK_DATE },
    { url: '/contact', priority: 0.7, changeFrequency: 'monthly', modified: FALLBACK_DATE },
    { url: '/terms', priority: 0.4, changeFrequency: 'yearly', modified: FALLBACK_DATE },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified: route.modified,
    changeFrequency: route.changeFrequency as any,
    priority: route.priority,
  }));

  // ۳. صفحه‌ی مادر «راهنمای خرید» و همه‌ی صفحات لندینگ سئو؛ تاریخ هر صفحه از فیلد updated خودش خوانده می‌شود
  // (هر وقت محتوای صفحه‌ای را عوض کردید، updated همان صفحه را هم عوض کنید)
  const updatedOf = new Map(landingPages.map((page) => [page.slug, page.updated]));
  const newestLanding = landingPages.reduce((max, page) => (page.updated > max ? page.updated : max), '2026-10-04');
  const guideRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/guides`, lastModified: new Date(newestLanding), changeFrequency: 'weekly', priority: 0.8 },
    ...landingMeta.map((m) => ({
      url: `${baseUrl}/${m.slug}`,
      lastModified: new Date(updatedOf.get(m.slug) ?? '2026-10-04'),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];

  // ۴. دسته‌بندی‌ها: تاریخ تازه‌ترین محصول همان دسته (اگر محصولی نبود، تاریخ ساخت دسته)
  const categoryRoutes: MetadataRoute.Sitemap = (categories || []).map((category) => {
    const latest = latestByCategory.get(String(category.id));
    return {
      url: `${baseUrl}/category/${category.slug}`,
      lastModified: latest ? new Date(latest) : category.created_at ? new Date(category.created_at) : FALLBACK_DATE,
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  // ۵. محصولات واقعی از دیتابیس
  const productRoutes: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: product.created_at ? new Date(product.created_at) : FALLBACK_DATE,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // ترکیب تمام مسیرها و تولید خروجی برای گوگل
  return [...staticRoutes, ...guideRoutes, ...categoryRoutes, ...productRoutes];
}
