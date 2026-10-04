// مسیر فایل: src/lib/landing-catalog.ts
// دریافت محصولات زنده از دیتابیس برای صفحات لندینگ (سمت سرور). اگر دیتابیس در دسترس نبود، صفحه بدون کارت محصول ساخته می‌شود و خراب نمی‌شود.

import { supabase } from "@/lib/supabase";
import { normalizeFa } from "@/data/landing/meta";
import type { ProductMatch } from "@/data/landing/types";

export interface CatalogProduct {
  id: string;
  title: string;
  slug: string;
  price: number; // قیمت نهایی (با تخفیف در صورت وجود)
  image: string | null;
  text: string; // عنوان + کلمات کلیدی نرمال‌شده برای تطبیق
  categorySlug: string | null;
  categoryName: string | null;
}

interface Row {
  id: string | number;
  title: string;
  slug: string;
  price: number | string | null;
  discount_price: number | string | null;
  images: string[] | null;
  seo_keywords: string | null;
  categories: { name: string; slug: string } | { name: string; slug: string }[] | null;
}

export async function getCatalog(): Promise<CatalogProduct[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id,title,slug,price,discount_price,images,seo_keywords,created_at,categories(name,slug)")
      .eq("is_available", true)
      .order("created_at", { ascending: false });
    if (error || !data) return [];
    return (data as unknown as Row[]).map((p) => {
      const cat = Array.isArray(p.categories) ? p.categories[0] : p.categories;
      const price = Number(p.price) || 0;
      const disc = Number(p.discount_price) || 0;
      return {
        id: String(p.id),
        title: String(p.title),
        slug: String(p.slug),
        price: disc > 0 && disc < price ? disc : price,
        image: Array.isArray(p.images) && p.images.length ? String(p.images[0]) : null,
        text: normalizeFa(`${p.title} ${p.seo_keywords ?? ""}`),
        categorySlug: cat?.slug ?? null,
        categoryName: cat?.name ?? null,
      } as CatalogProduct;
    });
  } catch {
    return [];
  }
}

export function pickProducts(all: CatalogProduct[], m: ProductMatch, min = 4): CatalogProduct[] {
  const limit = m.limit ?? 8;
  const words = (m.words ?? []).map(normalizeFa);
  const not = (m.not ?? []).map(normalizeFa);
  const inCats = (p: CatalogProduct) => !m.categories || (p.categorySlug !== null && m.categories.includes(p.categorySlug));
  let picked = all.filter((p) => {
    if (not.some((w) => p.text.includes(w))) return false;
    if (words.length) return inCats(p) && words.some((w) => p.text.includes(w));
    return inCats(p);
  });
  if (picked.length < min && m.fill?.length) {
    const ids = new Set(picked.map((p) => p.id));
    picked = [...picked, ...all.filter((p) => !ids.has(p.id) && p.categorySlug && m.fill!.includes(p.categorySlug))];
  }
  return picked.slice(0, limit);
}

export function priceSummary(list: CatalogProduct[]) {
  const prices = list.map((p) => p.price).filter((n) => n > 0);
  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices), count: list.length };
}

export function categoryPriceTable(all: CatalogProduct[]) {
  const map = new Map<string, number[]>();
  for (const p of all) if (p.categoryName && p.price > 0) map.set(p.categoryName, [...(map.get(p.categoryName) ?? []), p.price]);
  return [...map.entries()].map(([name, ps]) => ({ name, count: ps.length, min: Math.min(...ps), max: Math.max(...ps) }));
}

export const formatToman = (n: number) => n.toLocaleString("fa-IR");
