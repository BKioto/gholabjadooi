import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // ⚠️ اضافه‌شده: ریدایرکتِ ۳۰۱ برای صفحه‌ی /partners که کامل حذف شد.
  // دلیل: آن صفحه شامل لینک‌های متقابل بین چند سایتِ هم‌مالک بود که طبق
  // دستورالعمل رسمی گوگل (Link Schemes) ریسک افت رتبه یا نادیده‌گرفتن کل
  // شبکه توسط گوگل را داشت. این ریدایرکت تضمین می‌کند اگر گوگل یا کاربری
  // قبلاً این آدرس را داشته باشد، به‌جای خطای ۴۰۴ به صفحه‌ی اصلی برود.
  async redirects() {
    return [
      {
        source: '/partners',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;