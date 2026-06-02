// مسیر فایل: src/data/seo/index.ts

import { everlastingBouquetsSeo } from "./everlasting-bouquets";
import { fantasyDollsSeo } from "./fantasy-dolls";
import { homeDecorSeo } from "./home-decor";
import { accessoriesSeo } from "./accessories";
import { babySetsSeo } from "./baby-sets";
import { giftsAndSouvenirsSeo } from "./gifts-and-souvenirs";

// تعریف تایپ برای دیتای سئو
export interface CategorySeoContent {
  title: string;
  content: React.ReactNode;
}

// ساخت یک دیکشنری مرکزی برای اتصال اسلاگ‌ها به محتواها
export const categorySeoDictionary: Record<string, CategorySeoContent> = {
  "everlasting-bouquets": everlastingBouquetsSeo,
  "fantasy-dolls": fantasyDollsSeo,
  "home-decor": homeDecorSeo,
  "accessories": accessoriesSeo,
  "baby-sets": babySetsSeo,
  "gifts-and-souvenirs": giftsAndSouvenirsSeo,
};