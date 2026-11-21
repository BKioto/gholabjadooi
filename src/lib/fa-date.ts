// مسیر فایل: src/lib/fa-date.ts
// تاریخ شمسی برای نمایش به مشتری (مثلاً «۳۰ آبان ۱۴۰۵»). همیشه به وقت ایران.

/** تاریخ را شمسی و به وقت ایران برمی‌گرداند. اگر ورودی خراب باشد، رشته‌ی خالی. */
export function formatFaDate(input: string | number | Date): string {
  const d = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(d.getTime())) return "";
  try {
    return d.toLocaleDateString("fa-IR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Tehran",
    });
  } catch {
    return "";
  }
}
