// مسیر فایل: src/app/terms/page.tsx
"use client";

import { motion } from "framer-motion";
import { Scale, ShieldCheck, Truck, RefreshCcw, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* عنوان صفحه */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-200/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Scale className="w-10 h-10 text-gray-600" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-display text-text-dark mb-4"
          >
            قوانین و <span className="text-primary-pink">مقررات</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-sans text-gray-500"
          >
            شرایط استفاده از خدمات فروشگاه و حقوق متقابل مشتری و تیم ما
          </motion.p>
        </div>

        {/* محتوای قوانین */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-gray-100 flex flex-col gap-10"
        >
          
          {/* بخش اول */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-primary-pink/10 p-2 rounded-xl">
                <FileText className="w-6 h-6 text-primary-pink" />
              </div>
              <h2 className="text-2xl font-bold text-text-dark">۱. شرایط عمومی</h2>
            </div>
            <div className="text-gray-600 font-sans leading-relaxed text-justify flex flex-col gap-3 pr-2 border-r-2 border-gray-100">
              <p>ورود کاربران به وب‌سایت قلاب جادویی و ثبت سفارش، به معنای آگاه بودن و پذیرفتن شرایط و قوانین این فروشگاه است. تمامی اصول و رویه‌های ما منطبق با قوانین جمهوری اسلامی ایران، قانون تجارت الکترونیک و قانون حمایت از حقوق مصرف‌کننده است.</p>
            </div>
          </section>

          {/* بخش دوم */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-soft-blue/20 p-2 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-soft-blue" />
              </div>
              <h2 className="text-2xl font-bold text-text-dark">۲. حفظ حریم خصوصی</h2>
            </div>
            <div className="text-gray-600 font-sans leading-relaxed text-justify flex flex-col gap-3 pr-2 border-r-2 border-gray-100">
              <p>تیم ما به اطلاعات خصوصی اشخاصی که از خدمات سایت استفاده می‌کنند، احترام گذاشته و از آن محافظت می‌کند. اطلاعات تماس و آدرس شما صرفاً جهت ارسال سفارشات استفاده شده و به هیچ وجه در اختیار شخص ثالث قرار نخواهد گرفت.</p>
            </div>
          </section>

          {/* بخش سوم */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-mint-green/20 p-2 rounded-xl">
                <Truck className="w-6 h-6 text-mint-green" />
              </div>
              <h2 className="text-2xl font-bold text-text-dark">۳. ثبت، پردازش و ارسال سفارش</h2>
            </div>
            <div className="text-gray-600 font-sans leading-relaxed text-justify flex flex-col gap-3 pr-2 border-r-2 border-gray-100">
              <p>از آنجا که تمامی محصولات ما هنر دست بوده و توسط تیم حرفه‌ای ما بافته می‌شوند، سفارشات شما نیازمند زمان برای آماده‌سازی هستند. این زمان بسته به حجم سفارش بین ۳ تا ۷ روز کاری متغیر است.</p>
              <p>پس از آماده‌سازی، سفارش شما از طریق پست پیشتاز ارسال خواهد شد. <strong>لازم به ذکر است که هزینه پستی به صورت پس‌کرایه بوده و پرداخت آن درب منزل بر عهده مشتری عزیز می‌باشد.</strong> هزینه‌ای که در سایت پرداخت می‌کنید صرفاً شامل بهای کالا و هزینه بسته‌بندی ایمن مرسوله است.</p>
              <p>کد رهگیری پستی از طریق پیام‌رسان‌ها و یا پیامک برای شما ارسال خواهد شد. مسئولیت هرگونه تاخیر پس از تحویل مرسوله به اداره پست، بر عهده شرکت پست جمهوری اسلامی ایران می‌باشد.</p>
            </div>
          </section>

          {/* بخش چهارم */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-soft-yellow/30 p-2 rounded-xl">
                <RefreshCcw className="w-6 h-6 text-soft-yellow" />
              </div>
              <h2 className="text-2xl font-bold text-text-dark">۴. شرایط مرجوعی و بازگشت کالا</h2>
            </div>
            <div className="text-gray-600 font-sans leading-relaxed text-justify flex flex-col gap-3 pr-2 border-r-2 border-gray-100">
              <p>محصولات ما شامل کالاهای سفارشی و دست‌بافت هستند. به دلیل ماهیت سفارشی بودن کالاها و رعایت مسائل بهداشتی، امکان انصراف از خرید یا مرجوع کردن کالا به دلایل سلیقه‌ای وجود ندارد.</p>
              <p>تنها در صورتی که کالای ارسال شده دارای نقص فیزیکی آشکار بوده یا با مشخصات ثبت شده در فاکتور مغایرت داشته باشد، مشتری موظف است نهایتاً تا ۲۴ ساعت پس از دریافت بسته، موضوع را همراه با عکس به پشتیبانی ما در پیام‌رسان بله اطلاع دهد تا هماهنگی‌های لازم برای بازگشت کالا و جبران خسارت انجام شود.</p>
            </div>
          </section>

        </motion.div>

        {/* تاریخ آخرین بروزرسانی */}
        <div className="text-center mt-8 text-sm text-gray-400 font-sans">
          آخرین بروزرسانی قوانین: {new Date().toLocaleDateString('fa-IR')}
        </div>

      </div>
    </div>
  );
}