// مسیر فایل: src/app/faq/page.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import Link from "next/link";

// دیتای اسکیما برای صفحه سوالات متداول
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "آماده‌سازی و بافت سفارشات چقدر زمان می‌برد؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "از آنجایی که تمامی محصولات توسط تیم حرفه‌ای ما و کاملاً با دست بافته می‌شوند، بسته به حجم و پیچیدگی سفارش، آماده‌سازی آن بین ۳ تا ۷ روز کاری زمان می‌برد. ما کیفیت و ظرافت را فدای سرعت نمی‌کنیم."
      }
    },
    {
      "@type": "Question",
      "name": "آیا می‌توانم طرح یا عروسک اختصاصی خودم را سفارش دهم؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "بله، قطعاً! یکی از تخصص‌های اصلی تیم هنرمند ما، اجرای سفارشات اختصاصی از روی عکس است. کافیست عکس یا ایده خود را از طریق پیام‌رسان بله برای پشتیبانی ما ارسال کنید تا بررسی و قیمت‌گذاری شود."
      }
    },
    {
      "@type": "Question",
      "name": "نحوه شستشوی محصولات بافتنی و عروسک‌ها چگونه است؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "تمامی محصولات ما از کامواهای باکیفیت و الیاف ضدحساسیت پر شده‌اند و قابل شستشو هستند. پیشنهاد می‌کنیم آن‌ها را با آب سرد (حداکثر ۳۰ درجه)، مایع لباسشویی ملایم و با دست بشویید. از چلاندن شدید یا انداختن در ماشین لباسشویی خودداری کنید تا فرم زیبای آن‌ها حفظ شود."
      }
    },
    {
      "@type": "Question",
      "name": "بسته‌ها چگونه ارسال می‌شوند و هزینه آن چطور محاسبه می‌شود؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "بسته‌بندی محصولات ما بسیار ایمن و فانتزی است (که هزینه جزئی ۵۰ هزار تومان در فاکتور برای آن لحاظ می‌شود). ارسال از طریق پست پیشتاز انجام شده و هزینه پستی به صورت پس‌کرایه می‌باشد؛ یعنی کرایه پستی را هنگام دریافت بسته، درب منزل به مامور پست پرداخت می‌کنید."
      }
    },
    {
      "@type": "Question",
      "name": "آیا امکان ثبت سفارش عمده برای گیفت عروسی یا تولد وجود دارد؟",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "بله، تیم ما آمادگی پذیرش سفارشات عمده برای رویدادهای خاص شما را دارد. برای سفارشات با تعداد بالا، تخفیف‌های ویژه‌ای در نظر گرفته می‌شود. لطفاً برای هماهنگی زمان‌بندی، حداقل از یک ماه قبل با ما در تماس باشید."
      }
    }
  ]
};

// دیتای سوالات پرتکرار
const faqs = [
  {
    question: "آماده‌سازی و بافت سفارشات چقدر زمان می‌برد؟",
    answer: "از آنجایی که تمامی محصولات توسط تیم حرفه‌ای ما و کاملاً با دست بافته می‌شوند، بسته به حجم و پیچیدگی سفارش، آماده‌سازی آن بین ۳ تا ۷ روز کاری زمان می‌برد. ما کیفیت و ظرافت را فدای سرعت نمی‌کنیم."
  },
  {
    question: "آیا می‌توانم طرح یا عروسک اختصاصی خودم را سفارش دهم؟",
    answer: "بله، قطعاً! یکی از تخصص‌های اصلی تیم هنرمند ما، اجرای سفارشات اختصاصی از روی عکس است. کافیست عکس یا ایده خود را از طریق پیام‌رسان بله برای پشتیبانی ما ارسال کنید تا بررسی و قیمت‌گذاری شود."
  },
  {
    question: "نحوه شستشوی محصولات بافتنی و عروسک‌ها چگونه است؟",
    answer: "تمامی محصولات ما از کامواهای باکیفیت و الیاف ضدحساسیت پر شده‌اند و قابل شستشو هستند. پیشنهاد می‌کنیم آن‌ها را با آب سرد (حداکثر ۳۰ درجه)، مایع لباسشویی ملایم و با دست بشویید. از چلاندن شدید یا انداختن در ماشین لباسشویی خودداری کنید تا فرم زیبای آن‌ها حفظ شود."
  },
  {
    question: "بسته‌ها چگونه ارسال می‌شوند و هزینه آن چطور محاسبه می‌شود؟",
    answer: "بسته‌بندی محصولات ما بسیار ایمن و فانتزی است (که هزینه جزئی ۵۰ هزار تومان در فاکتور برای آن لحاظ می‌شود). ارسال از طریق پست پیشتاز انجام شده و هزینه پستی به صورت پس‌کرایه می‌باشد؛ یعنی کرایه پستی را هنگام دریافت بسته، درب منزل به مامور پست پرداخت می‌کنید."
  },
  {
    question: "آیا امکان ثبت سفارش عمده برای گیفت عروسی یا تولد وجود دارد؟",
    answer: "بله، تیم ما آمادگی پذیرش سفارشات عمده برای رویدادهای خاص شما را دارد. برای سفارشات با تعداد بالا، تخفیف‌های ویژه‌ای در نظر گرفته می‌شود. لطفاً برای هماهنگی زمان‌بندی، حداقل از یک ماه قبل با ما در تماس باشید."
  }
];

export default function FAQPage() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* عنوان صفحه */}
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-pink/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <HelpCircle className="w-10 h-10 text-primary-pink" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-display text-text-dark mb-4"
          >
            سوالات <span className="text-primary-pink">متداول</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-sans text-gray-500"
          >
            پاسخ پرتکرارترین سوالات شما درباره هنر دستِ تیم ما
          </motion.p>
        </div>

        {/* لیست سوالات (آکاردئون) */}
        <div className="flex flex-col gap-4 mb-16">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                activeIndex === index ? "border-primary-pink/30 shadow-md" : "border-gray-100 shadow-sm"
              }`}
            >
              <button 
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-right focus:outline-none"
              >
                <h3 className={`font-bold text-lg font-sans pr-2 border-r-4 transition-colors ${
                  activeIndex === index ? "border-primary-pink text-primary-pink" : "border-transparent text-text-dark"
                }`}>
                  {faq.question}
                </h3>
                <ChevronDown 
                  className={`w-6 h-6 shrink-0 transition-transform duration-300 ${
                    activeIndex === index ? "rotate-180 text-primary-pink" : "text-gray-400"
                  }`} 
                />
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6 pt-0 text-gray-600 font-sans leading-relaxed text-justify border-t border-gray-50 mt-2">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* بنر ارتباط با پشتیبانی */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-soft-blue/20 rounded-[2.5rem] p-8 sm:p-12 text-center flex flex-col items-center border border-soft-blue/30"
        >
          <h3 className="text-2xl font-bold text-text-dark mb-3">جواب سوالتون رو پیدا نکردید؟</h3>
          <p className="text-gray-600 font-sans mb-8">
            تیم پشتیبانی ما با کمال میل آماده پاسخگویی و راهنمایی شماست.
          </p>
          <Link href="/contact" className="bg-white text-text-dark px-8 py-4 rounded-full font-bold shadow-sm hover:shadow-md hover:scale-105 transition-all flex items-center gap-2 border border-gray-100">
            <MessageCircle className="w-5 h-5 text-soft-blue" />
            ارتباط با پشتیبانی تیم
          </Link>
        </motion.div>

      </div>
    </div>
  );
}