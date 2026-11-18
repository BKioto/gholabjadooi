// مسیر فایل: src/data/landing/types.ts
// ساختار داده‌ی صفحات لندینگ سئو (صفحات استاتیک)

export type Block =
  | string // پاراگراف (پشتیبانی از **ضخیم** و [متن لینک](/مسیر))
  | { h3: string }
  | { ul: string[] }
  | { ol: string[] }
  | { tip: string }
  | { table: { head: string[]; rows: string[][] } };

export interface Section {
  id: string; // شناسه‌ی انگلیسی برای لینک داخلی صفحه (فهرست مطالب)
  h2: string;
  blocks: Block[];
}

export interface Faq {
  q: string;
  a: string;
}

// نحوه‌ی انتخاب محصولات زنده از دیتابیس برای نمایش در هر صفحه
export interface ProductMatch {
  categories?: string[]; // اسلاگ دسته‌بندی‌ها
  words?: string[]; // کلمات مطابقت در عنوان/کلمات کلیدی محصول
  not?: string[]; // کلماتی که محصول نباید داشته باشد
  fill?: string[]; // اگر محصول کم بود، از این دسته‌ها تکمیل شود
  first?: string[]; // محصولاتی که یکی از این کلمات را دارند، بالاتر از بقیه نمایش داده می‌شوند
  mix?: boolean; // نمایش متنوع: از هر دسته‌بندی به‌نوبت یک محصول (مناسب صفحات عمومی)
  limit?: number; // تعداد کارت نمایش‌داده‌شده (پیش‌فرض ۱۲)؛ شمارش و بازه‌ی قیمت از «همه‌ی» محصولات منطبق حساب می‌شود
}

export type LandingGroup = "category" | "product" | "occasion" | "service" | "city";

export interface LandingPage {
  slug: string;
  group: LandingGroup;
  chip: string; // برچسب کوتاه برای لینک‌ها
  metaTitle: string; // بدون نام برند (لایه‌ی اصلی خودش « | قلاب جادویی » اضافه می‌کند)
  metaDescription: string;
  h1: string;
  imageAlt: string;
  image?: string; // مسیر تصویر شاخص (اگر نباشد: /landing/<slug>.webp)
  intro: string[];
  sections: Section[];
  faqs: Faq[];
  match: ProductMatch;
  productsTitle: string; // تیتر بخش محصولات
  related: string[]; // اسلاگ صفحات مرتبط (لینک‌دهی داخلی)
  updated: string; // YYYY-MM-DD
  showPriceTable?: boolean;
}
