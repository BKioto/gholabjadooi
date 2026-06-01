// src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // جلوگیری از خزش ربات‌ها در صفحات خصوصی و سبد خرید
      disallow: ['/cart', '/checkout', '/track-order'], 
    },
    // 👈 مشکل اول در این خط برطرف شد (www اضافه شد)
    sitemap: 'https://www.gholabjadooi.ir/sitemap.xml',
  };
}