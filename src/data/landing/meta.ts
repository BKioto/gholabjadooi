// مسیر فایل: src/data/landing/meta.ts
// ⚠️ این فایل عمداً سبک است (فقط اسلاگ + برچسب) تا بدون مشکل در Footer/Navbar (کلاینت) هم استفاده شود.

import type { LandingGroup } from "./types";

export const SITE_URL = "https://www.gholabjadooi.ir";

export const groupLabels: Record<LandingGroup, string> = {
  category: "دسته‌های اصلی بافتنی",
  product: "محصولات پرطرفدار",
  occasion: "هدیه برای مناسبت‌ها",
  service: "سفارش، قیمت و ارسال",
  city: "خرید بافتنی دست‌ساز در شهر شما",
};

export const landingMeta: { slug: string; chip: string; group: LandingGroup }[] = [
  { slug: "buy-crochet-bouquet", chip: "خرید دسته گل بافتنی", group: "category" },
  { slug: "buy-amigurumi-doll", chip: "خرید عروسک آمیگورومی", group: "category" },
  { slug: "buy-crochet-girls-accessories", chip: "اکسسوری بافتنی دخترانه", group: "category" },
  { slug: "buy-crochet-home-decor", chip: "دکوری بافتنی", group: "category" },
  { slug: "buy-handmade-gift", chip: "خرید هدیه دست‌ساز", group: "category" },
  { slug: "buy-crochet-baby-set", chip: "ست نوزادی بافتنی", group: "category" },
  { slug: "buy-crochet-bag", chip: "کیف بافتنی", group: "product" },
  { slug: "buy-crochet-bucket-hat", chip: "کلاه باکت بافتنی", group: "product" },
  { slug: "buy-crochet-bandana", chip: "باندانا بافتنی", group: "product" },
  { slug: "buy-crochet-keychain", chip: "جاکلیدی بافتنی", group: "product" },
  { slug: "buy-crochet-bunny-doll", chip: "عروسک خرگوش بافتنی", group: "product" },
  { slug: "buy-crochet-coaster", chip: "زیرلیوانی بافتنی", group: "product" },
  { slug: "buy-crochet-crop-top", chip: "کراپ تاپ بافتنی", group: "product" },
  { slug: "buy-crochet-plant-pot", chip: "گلدان و کاکتوس بافتنی", group: "product" },
  { slug: "buy-crochet-car-charm", chip: "آویز ماشین بافتنی", group: "product" },
  { slug: "buy-crochet-toy-hammock", chip: "تور آویز عروسک", group: "product" },
  { slug: "handmade-girls-birthday-gift", chip: "هدیه تولد دخترانه", group: "occasion" },
  { slug: "handmade-yalda-gift", chip: "هدیه شب یلدا", group: "occasion" },
  { slug: "handmade-valentine-gift", chip: "هدیه ولنتاین", group: "occasion" },
  { slug: "handmade-mothers-day-gift", chip: "هدیه روز مادر", group: "occasion" },
  { slug: "custom-crochet-doll-from-photo", chip: "سفارش عروسک از روی عکس", group: "service" },
  { slug: "wholesale-crochet-gifts", chip: "سفارش عمده گیفت بافتنی", group: "service" },
  { slug: "crochet-handmade-price-list", chip: "قیمت محصولات بافتنی", group: "service" },
  { slug: "crochet-shipping-all-iran", chip: "ارسال به سراسر ایران", group: "service" },
  { slug: "buy-crochet-doll-tehran", chip: "عروسک بافتنی در تهران", group: "city" },
  { slug: "buy-crochet-bouquet-isfahan", chip: "دسته گل بافتنی در اصفهان", group: "city" },
  { slug: "buy-crochet-bag-mashhad", chip: "کیف بافتنی در مشهد", group: "city" },
  { slug: "buy-handmade-crochet-ahvaz", chip: "بافتنی دست‌ساز در اهواز", group: "city" },
  { slug: "buy-handmade-crochet-shiraz", chip: "بافتنی دست‌ساز در شیراز", group: "city" },
  { slug: "buy-handmade-crochet-tabriz", chip: "بافتنی دست‌ساز در تبریز", group: "city" },
];

export const chipOf = (slug: string) => landingMeta.find((m) => m.slug === slug)?.chip ?? slug;

// یکدست‌سازی متن فارسی برای مقایسه (نیم‌فاصله، ی/ک عربی، فاصله‌های اضافه)
export function normalizeFa(s: string): string {
  return (s || "")
    .replace(/\u200c/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/[()،,.:؛]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// ─── لینک‌دهی داخلی: از هر دسته‌بندی به صفحات لندینگ مرتبط ───
export const guidesByCategory: Record<string, string[]> = {
  "everlasting-bouquets": ["buy-crochet-bouquet", "handmade-valentine-gift", "handmade-mothers-day-gift", "buy-crochet-bouquet-isfahan"],
  "fantasy-dolls": ["buy-amigurumi-doll", "buy-crochet-bunny-doll", "custom-crochet-doll-from-photo", "buy-crochet-doll-tehran"],
  "home-decor": ["buy-crochet-home-decor", "buy-crochet-coaster", "buy-crochet-plant-pot", "buy-crochet-toy-hammock"],
  accessories: ["buy-crochet-girls-accessories", "buy-crochet-bag", "buy-crochet-bucket-hat", "buy-crochet-bandana", "buy-crochet-keychain", "buy-crochet-crop-top"],
  "baby-sets": ["buy-crochet-baby-set", "buy-crochet-bunny-doll", "wholesale-crochet-gifts"],
  "gifts-and-souvenirs": ["buy-handmade-gift", "wholesale-crochet-gifts", "handmade-yalda-gift", "handmade-girls-birthday-gift", "buy-crochet-keychain"],
};

// ─── لینک‌دهی داخلی: از هر محصول به صفحات لندینگ مرتبط (بر اساس عنوان و کلمات کلیدی) ───
const productRules: { re: RegExp; not?: RegExp; slugs: string[] }[] = [
  { re: /دسته گل|گل بافتنی|آفتابگردان|لاله|رز /, slugs: ["buy-crochet-bouquet", "handmade-valentine-gift", "handmade-mothers-day-gift"] },
  { re: /خرگوش/, slugs: ["buy-crochet-bunny-doll", "buy-amigurumi-doll"] },
  { re: /عروسک|آمیگورومی/, slugs: ["buy-amigurumi-doll", "custom-crochet-doll-from-photo"] },
  { re: /آویز ماشین/, slugs: ["buy-crochet-car-charm"] },
  { re: /جاکلیدی|آویز کیف|آویز موبایل/, slugs: ["buy-crochet-keychain"] },
  { re: /کیف|توت بگ/, not: /آویز کیف|جاکلیدی/, slugs: ["buy-crochet-bag"] },
  { re: /کلاه/, slugs: ["buy-crochet-bucket-hat"] },
  { re: /باندانا|سربند|اسکارف/, slugs: ["buy-crochet-bandana"] },
  { re: /کراپ|تاپ/, slugs: ["buy-crochet-crop-top"] },
  { re: /زیرلیوانی|کوستر/, slugs: ["buy-crochet-coaster"] },
  { re: /گلدان|کاکتوس/, slugs: ["buy-crochet-plant-pot"] },
  { re: /تور آویز|بانوج|ننو/, slugs: ["buy-crochet-toy-hammock"] },
  { re: /نوزاد|سیسمونی/, slugs: ["buy-crochet-baby-set"] },
  { re: /تولد/, slugs: ["handmade-girls-birthday-gift"] },
];

export function guidesForProduct(text: string, categorySlug?: string | null, max = 6): string[] {
  const t = normalizeFa(text);
  const out: string[] = [];
  const add = (s: string) => out.includes(s) || out.push(s);
  for (const r of productRules) if (r.re.test(t) && !(r.not && r.not.test(t))) r.slugs.forEach(add);
  (guidesByCategory[categorySlug ?? ""] ?? []).forEach(add);
  ["buy-handmade-gift", "crochet-shipping-all-iran", "crochet-handmade-price-list"].forEach(add);
  return out.slice(0, max);
}
