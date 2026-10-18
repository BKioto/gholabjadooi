// مسیر فایل: src/app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // جلوگیری از خزش ربات‌ها در صفحات خصوصی، سبد خرید و پنل مدیریت
      disallow: ['/cart', '/checkout', '/track-order', '/admin'], 
    },
    sitemap: 'https://www.gholabjadooi.ir/sitemap.xml',
  };
}