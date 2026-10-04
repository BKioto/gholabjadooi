// مسیر فایل: src/data/landing/pages/index.ts
// رجیستری ۳۰ صفحه‌ی لندینگ (فقط سمت سرور؛ محتوا سنگین است و نباید در کامپوننت‌های کلاینت import شود)
import type { LandingPage } from "../types";
import buyCrochetBouquet from "./buy-crochet-bouquet";
import buyAmigurumiDoll from "./buy-amigurumi-doll";
import buyCrochetGirlsAccessories from "./buy-crochet-girls-accessories";
import buyCrochetHomeDecor from "./buy-crochet-home-decor";
import buyHandmadeGift from "./buy-handmade-gift";
import buyCrochetBabySet from "./buy-crochet-baby-set";
import buyCrochetBag from "./buy-crochet-bag";
import buyCrochetBucketHat from "./buy-crochet-bucket-hat";
import buyCrochetBandana from "./buy-crochet-bandana";
import buyCrochetKeychain from "./buy-crochet-keychain";
import buyCrochetBunnyDoll from "./buy-crochet-bunny-doll";
import buyCrochetCoaster from "./buy-crochet-coaster";
import buyCrochetCropTop from "./buy-crochet-crop-top";
import buyCrochetPlantPot from "./buy-crochet-plant-pot";
import buyCrochetCarCharm from "./buy-crochet-car-charm";
import buyCrochetToyHammock from "./buy-crochet-toy-hammock";
import handmadeGirlsBirthdayGift from "./handmade-girls-birthday-gift";
import handmadeYaldaGift from "./handmade-yalda-gift";
import handmadeValentineGift from "./handmade-valentine-gift";
import handmadeMothersDayGift from "./handmade-mothers-day-gift";
import customCrochetDollFromPhoto from "./custom-crochet-doll-from-photo";
import wholesaleCrochetGifts from "./wholesale-crochet-gifts";
import crochetHandmadePriceList from "./crochet-handmade-price-list";
import crochetShippingAllIran from "./crochet-shipping-all-iran";
import buyCrochetDollTehran from "./buy-crochet-doll-tehran";
import buyCrochetBouquetIsfahan from "./buy-crochet-bouquet-isfahan";
import buyCrochetBagMashhad from "./buy-crochet-bag-mashhad";
import buyHandmadeCrochetAhvaz from "./buy-handmade-crochet-ahvaz";
import buyHandmadeCrochetShiraz from "./buy-handmade-crochet-shiraz";
import buyHandmadeCrochetTabriz from "./buy-handmade-crochet-tabriz";

export const landingPages: LandingPage[] = [buyCrochetBouquet, buyAmigurumiDoll, buyCrochetGirlsAccessories, buyCrochetHomeDecor, buyHandmadeGift, buyCrochetBabySet, buyCrochetBag, buyCrochetBucketHat, buyCrochetBandana, buyCrochetKeychain, buyCrochetBunnyDoll, buyCrochetCoaster, buyCrochetCropTop, buyCrochetPlantPot, buyCrochetCarCharm, buyCrochetToyHammock, handmadeGirlsBirthdayGift, handmadeYaldaGift, handmadeValentineGift, handmadeMothersDayGift, customCrochetDollFromPhoto, wholesaleCrochetGifts, crochetHandmadePriceList, crochetShippingAllIran, buyCrochetDollTehran, buyCrochetBouquetIsfahan, buyCrochetBagMashhad, buyHandmadeCrochetAhvaz, buyHandmadeCrochetShiraz, buyHandmadeCrochetTabriz];

export const getLandingPage = (slug: string) => landingPages.find((p) => p.slug === slug);
