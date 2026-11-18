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
  { slug: "buy-crochet-winter-accessories", chip: "شال گردن و دستکش بافتنی", group: "product" },
  { slug: "buy-crochet-beret-hat", chip: "کلاه برت بافتنی", group: "product" },
  { slug: "buy-crochet-bridal-bouquet", chip: "دسته گل عروس بافتنی", group: "product" },
  { slug: "buy-crochet-doily-tablecloth", chip: "رومیزی دوایلی بافتنی", group: "product" },
  { slug: "buy-crochet-rope-basket-rug", chip: "سبد و فرشینه ریسمانی", group: "product" },
  { slug: "buy-crochet-baby-blanket-photo-set", chip: "پتو نوزادی و ست عکاسی", group: "product" },
  { slug: "buy-crochet-wall-decor", chip: "دکور دیواری بافتنی", group: "product" },
  { slug: "buy-crochet-fridge-magnet-souvenir", chip: "مگنت یخچال و سوغات بافتنی", group: "product" },
  { slug: "buy-crochet-finger-puppets", chip: "عروسک انگشتی بافتنی", group: "product" },
  { slug: "buy-crochet-hair-accessories", chip: "اسکرانچی و اکسسوری مو", group: "product" },
  { slug: "buy-crochet-earrings-brooch", chip: "گوشواره و سنجاق سینه", group: "product" },
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
  "everlasting-bouquets": ["buy-crochet-bouquet", "buy-crochet-bridal-bouquet", "handmade-valentine-gift", "handmade-mothers-day-gift", "buy-crochet-bouquet-isfahan"],
  "fantasy-dolls": ["buy-amigurumi-doll", "buy-crochet-bunny-doll", "buy-crochet-finger-puppets", "custom-crochet-doll-from-photo", "handmade-girls-birthday-gift", "buy-crochet-doll-tehran"],
  "home-decor": ["buy-crochet-home-decor", "buy-crochet-doily-tablecloth", "buy-crochet-rope-basket-rug", "buy-crochet-wall-decor", "buy-crochet-coaster", "buy-crochet-plant-pot", "buy-crochet-toy-hammock", "handmade-mothers-day-gift", "handmade-yalda-gift"],
  accessories: ["buy-crochet-girls-accessories", "buy-crochet-winter-accessories", "buy-crochet-beret-hat", "buy-crochet-hair-accessories", "buy-crochet-earrings-brooch", "buy-crochet-bag", "buy-crochet-bucket-hat", "buy-crochet-bandana", "buy-crochet-keychain", "buy-crochet-crop-top", "buy-handmade-crochet-tabriz"],
  "baby-sets": ["buy-crochet-baby-set", "buy-crochet-baby-blanket-photo-set", "buy-crochet-bunny-doll", "buy-crochet-wall-decor", "wholesale-crochet-gifts"],
  "gifts-and-souvenirs": ["buy-handmade-gift", "buy-crochet-fridge-magnet-souvenir", "wholesale-crochet-gifts", "handmade-yalda-gift", "handmade-girls-birthday-gift", "handmade-mothers-day-gift", "buy-crochet-keychain", "buy-crochet-finger-puppets", "buy-crochet-earrings-brooch"],
};

// ─── لینک‌دهی داخلی: از هر محصول به راهنماهای مرتبط (بر اساس کلمات عنوان و کلمات کلیدی) ───
// ⚠️ متن ورودی قبلاً با normalizeFa یکدست شده است (نیم‌فاصله → فاصله)؛ پس «لاک‌پشت» به‌صورت «لاک پشت» بررسی می‌شود.
// قانون‌های دقیق‌تر را بالاتر بگذارید؛ خروجی نهایی حداکثر ۶ راهنماست.
const productRules: { re: RegExp; not?: RegExp; slugs: string[] }[] = [
  { re: /یلدا|هندوانه|انار/, slugs: ["handmade-yalda-gift"] },
  { re: /دسته گل عروس/, slugs: ["buy-crochet-bridal-bouquet", "buy-crochet-bouquet"] },
  { re: /دسته گل|گل بافتنی|آفتابگردان|لاله|گل رز|فلاور باکس/, slugs: ["buy-crochet-bouquet", "handmade-valentine-gift", "handmade-mothers-day-gift"] },
  { re: /انگشتی/, not: /نیم انگشتی/, slugs: ["buy-crochet-finger-puppets", "buy-amigurumi-doll"] },
  { re: /خرگوش/, slugs: ["buy-crochet-bunny-doll", "buy-amigurumi-doll"] },
  { re: /عروسک|آمیگورومی/, slugs: ["buy-amigurumi-doll", "custom-crochet-doll-from-photo"] },
  { re: /آویز ماشین|آویز آینه ماشین/, slugs: ["buy-crochet-car-charm"] },
  { re: /جاکلیدی|آویز کیف|آویز موبایل/, slugs: ["buy-crochet-keychain"] },
  { re: /مگنت|سوغات|یادگاری|باکس هدیه/, slugs: ["buy-crochet-fridge-magnet-souvenir", "buy-handmade-gift", "wholesale-crochet-gifts"] },
  { re: /گوشواره|سنجاق سینه/, slugs: ["buy-crochet-earrings-brooch", "buy-crochet-girls-accessories"] },
  { re: /اسکرانچی|کش مو|گیره مو|تل مو|گل سر|باندانای مو/, slugs: ["buy-crochet-hair-accessories", "buy-crochet-girls-accessories"] },
  { re: /(^| )کیف( |$)|توت بگ/, not: /آویز کیف|جاکلیدی/, slugs: ["buy-crochet-bag"] },
  { re: /(^| )برت( |$)/, slugs: ["buy-crochet-beret-hat", "buy-crochet-winter-accessories"] },
  { re: /کلاه/, slugs: ["buy-crochet-bucket-hat"] },
  { re: /شال گردن|دستکش|گوش پوش|هدبند/, slugs: ["buy-crochet-winter-accessories", "buy-handmade-crochet-tabriz", "buy-crochet-girls-accessories"] },
  { re: /باندانا|سربند|اسکارف/, slugs: ["buy-crochet-bandana"] },
  { re: /کراپ|تاپ/, slugs: ["buy-crochet-crop-top"] },
  { re: /زیرلیوانی|کوستر/, slugs: ["buy-crochet-coaster"] },
  { re: /گلدان|کاکتوس/, slugs: ["buy-crochet-plant-pot"] },
  { re: /تور آویز|بانوج|ننو/, slugs: ["buy-crochet-toy-hammock"] },
  { re: /رومیزی|دوایلی|زیرقابلمه|کاور جعبه دستمال/, slugs: ["buy-crochet-doily-tablecloth", "buy-crochet-home-decor"] },
  { re: /سبد|فرشینه|ریسمان|کوسن/, slugs: ["buy-crochet-rope-basket-rug", "buy-crochet-home-decor"] },
  { re: /رویاگیر|رنگین کمان|آویز تخت|دکور دیواری/, slugs: ["buy-crochet-wall-decor", "buy-crochet-home-decor"] },
  { re: /دکور|دکوری|کاور/, slugs: ["buy-crochet-home-decor", "handmade-mothers-day-gift"] },
  { re: /پتو|عکاسی|لاوی/, slugs: ["buy-crochet-baby-blanket-photo-set", "buy-crochet-baby-set"] },
  { re: /نوزاد|سیسمونی|جغجغه|پاپوش/, slugs: ["buy-crochet-baby-set"] },
  { re: /تولد/, not: /نوزاد|سیسمونی/, slugs: ["handmade-girls-birthday-gift"] },
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
