// مسیر فایل: src/data/seo/gifts-and-souvenirs.tsx

import Link from "next/link";

export const giftsAndSouvenirsSeo = {
  title: "سفارش عمده گیفت و یادگاری",
  content: (
    <div className="flex flex-col gap-6 text-gray-600 font-sans leading-relaxed text-justify">
      
      <h2 className="text-2xl font-bold text-text-dark mt-4">سفارش گیفت عروسی، تولد و یادگاری‌های خاص دست‌بافت</h2>
      <p>
        مراسم‌ها و رویدادهای مهم زندگی، با حضور عزیزانمان معنا پیدا می‌کنند و چه چیزی زیباتر از اینکه با یک یادگاری کوچک اما ارزشمند، از حضور آن‌ها قدردانی کنیم؟ در <strong>فروشگاه قلاب جادویی</strong>، ما به جای استفاده از گیفت‌های تکراری و پلاستیکی، <strong>گیفت‌های دست‌بافت و مینیاتوری</strong> را به شما پیشنهاد می‌دهیم. سفارش گیفت بافتنی برای عروسی، نامزدی، تولد و حتی رویدادهای شرکتی، نشان‌دهنده حسن سلیقه و ارزش بالایی است که شما برای مهمانان خود قائل هستید.
      </p>

      <h3 className="text-xl font-bold text-text-dark mt-4">انواع گیفت‌های فانتزی و کاربردی ما</h3>
      <p>
        گیفت‌های ما صرفاً یک وسیله تزئینی بی‌مصرف نیستند، بلکه طوری طراحی شده‌اند که مهمانان شما سال‌ها از آن‌ها استفاده کنند:
      </p>
      <ul className="list-disc list-inside space-y-2 pr-4 text-gray-500">
        <li><strong>جاکلیدی و آویز کیف کاموایی:</strong> در طرح‌های فانتزی مثل قلب، گل، حیوانات مینیاتوری و حروف اول اسم.</li>
        <li><strong>مگنت‌های یخچال بافتنی:</strong> یادگاری‌های کوچکی که هر روز جلوی چشم مهمانان شما خواهند بود.</li>
        <li><strong>بوک‌مارک (نشانگر کتاب) دست‌بافت:</strong> یک هدیه فرهنگی و بسیار شیک برای گیفت‌های روز معلم یا رویدادهای آموزشی.</li>
        <li><strong>مینی‌گلدان‌ها و کاکتوس‌های سایز کوچک:</strong> نمادی از رشد و سبزینگی، ایده‌آل برای گیفت‌های نامزدی.</li>
      </ul>

      {/* جایگاه عکس اختصاصی این دسته‌بندی با آلت‌تگ سئو شده */}
      <div className="my-8 rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 relative group">
        <img 
          src="/seo-categories/seo-gift.webp" 
          alt="سفارش عمده گیفت عروسی بافتنی، یادگاری تولد و جاکلیدی کاموایی دست ساز" 
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>

      <h2 className="text-2xl font-bold text-text-dark mt-4">سفارش عمده با قابلیت شخصی‌سازی کامل</h2>
      <p>
        تیم هنرمندان ما آمادگی دارد تا سفارشات با تعداد بالا را در کوتاه‌ترین زمان ممکن و با بالاترین کیفیت آماده کند. شما می‌توانید رنگ گیفت‌ها را دقیقاً با تم مراسم خود (مثل رنگ لباس عروس، تم تولد یا رنگ سازمانی شرکت) هماهنگ کنید. همچنین امکان نصب تگ‌های اسم و تاریخ روی گیفت‌ها وجود دارد تا خاطره مراسم شما برای همیشه ثبت شود.
      </p>

      <h3 className="text-xl font-bold text-text-dark mt-4">پیشنهادات ویژه برای ترکیب گیفت‌ها</h3>
      <p>
        اگر به دنبال هدایای لوکس‌تر یا پکیج‌های ترکیبی هستید، این ایده‌ها را از دست ندهید:
      </p>
      <ul className="list-disc list-inside space-y-3 pr-4 text-gray-500">
        <li>
          <strong>برای جشن سیسمونی (Baby Shower):</strong> سفارش گیفت‌های مینیاتوری مثل پاپوش یا شیشه شیر بافتنی در کنار محصولات <Link href="/category/baby-sets" className="text-primary-pink font-bold hover:underline transition-colors">ست نوزاد و سیسمونی</Link>، سوپرایزی بی‌نظیر است.
        </li>
        <li>
          <strong>هدایای لوکس (VIP):</strong> برای مهمانان ویژه خود، به جای گیفت‌های کوچک، می‌توانید از باکس‌های گل مینیاتوری در بخش <Link href="/category/everlasting-bouquets" className="text-primary-pink font-bold hover:underline transition-colors">دسته گل و باکس جاودان</Link> استفاده کنید.
        </li>
        <li>
          <strong>یادگاری‌های کاربردی منزل:</strong> مینی‌دیوارکوب‌ها یا زیرلیوانی‌های بافتنی که در دسته <Link href="/category/home-decor" className="text-primary-pink font-bold hover:underline transition-colors">دکوری و چیدمان منزل</Link> قرار دارند، هدایایی هستند که در هر خانه‌ای کاربرد دارند.
        </li>
      </ul>

    </div>
  )
};