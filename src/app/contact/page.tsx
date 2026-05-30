"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, Clock, Send } from "lucide-react";

// دیتای اسکیما برای صفحه تماس با ما (سئو شده با اطلاعات جدید)
const contactPageSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "name": "تماس با تیم قلاب جادویی",
  "description": "راه‌های ارتباطی، پشتیبانی در پیام‌رسان‌های بله و ایتا و شماره تماس‌های تیم حرفه‌ای قلاب جادویی",
  "mainEntity": {
    "@type": "Organization",
    "name": "قلاب جادویی",
    "telephone": "+989924230576",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+989924230576",
      "contactType": "customer service",
      "availableLanguage": "Persian"
    }
  }
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* عنوان صفحه */}
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-display text-text-dark mb-4"
          >
            تماس با <span className="text-primary-pink">تیم ما</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg font-sans text-gray-500 max-w-2xl mx-auto"
          >
            مشتاقانه منتظر شنیدن صدای شما و پاسخگویی به سوالاتتان هستیم
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* سمت راست: اطلاعات تماس و پشتیبانی */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 flex flex-col gap-6"
          >
            {/* کارت آدرس */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="bg-primary-pink/10 p-3 rounded-2xl shrink-0">
                <MapPin className="w-6 h-6 text-primary-pink" />
              </div>
              <div>
                <h3 className="font-bold text-text-dark mb-1">دفتر مرکزی تیم</h3>
                <p className="text-gray-500 font-sans text-sm leading-relaxed">
                  اهواز - کیان آباد
                </p>
              </div>
            </div>

            {/* کارت تماس */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="bg-soft-blue/20 p-3 rounded-2xl shrink-0">
                <Phone className="w-6 h-6 text-soft-blue" />
              </div>
              <div>
                <h3 className="font-bold text-text-dark mb-1">شماره تماس پشتیبانی</h3>
                <p className="font-sans text-sm mb-1 font-bold text-primary-pink" dir="ltr">+98 992 423 0576</p>
              </div>
            </div>

            {/* کارت ساعات کاری */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="bg-soft-yellow/30 p-3 rounded-2xl shrink-0">
                <Clock className="w-6 h-6 text-soft-yellow" />
              </div>
              <div>
                <h3 className="font-bold text-text-dark mb-1">ساعات کاری</h3>
                <p className="text-gray-500 font-sans text-sm">شنبه تا پنجشنبه: ۹ صبح تا ۲۰</p>
              </div>
            </div>

            {/* دکمه‌های پشتیبانی آنلاین در پیام‌رسان‌ها */}
            <div className="flex flex-col gap-3 mt-2">
              <a href="https://eitaa.com/gholabjadooi" target="_blank" rel="noopener noreferrer" className="bg-[#FFF0E8] text-[#E75B26] border border-[#E75B26]/30 p-4 rounded-2xl shadow-sm flex items-center justify-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all font-bold group">
                <svg width="24" height="24" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                  <circle cx="100" cy="100" r="100" fill="#E75B26"/>
                  <path d="M100 40C125 40 145 60 145 85C145 105 130 122 110 128V155L85 130H65C45 130 30 115 30 95C30 70 55 40 100 40ZM100 65C85 65 70 75 70 90C70 105 80 110 95 110H105L115 120V105C125 100 130 90 130 80C130 65 115 65 100 65Z" fill="white"/>
                </svg>
                ارتباط در پیام‌رسان ایتا
              </a>

              <a href="https://ble.ir/gholabjadooi" target="_blank" rel="noopener noreferrer" className="bg-[#E2F6F2] text-[#20BFA8] border border-[#20BFA8]/30 p-4 rounded-2xl shadow-sm flex items-center justify-center gap-3 hover:shadow-md hover:-translate-y-1 transition-all font-bold group">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                  <path d="M12 2C6.48 2 2 6.03 2 11C2 13.06 2.83 14.95 4.19 16.5C3.89 18.23 2.65 19.8 2.58 19.89C2.45 20.06 2.45 20.29 2.59 20.45C2.73 20.61 2.94 20.66 3.13 20.59C5.35 19.81 7.02 18.57 8.01 17.76C9.25 18.26 10.6 18.54 12 18.54C17.52 18.54 22 14.51 22 9.54C22 4.57 17.52 2 12 2Z" fill="#20BFA8"/>
                  <path d="M15.5 11.5C15.5 12.33 14.83 13 14 13H10C9.17 13 8.5 12.33 8.5 11.5C8.5 10.67 9.17 10 10 10H14C14.83 10 15.5 10.67 15.5 11.5Z" fill="white"/>
                </svg>
                ارتباط در پیام‌رسان بله
              </a>
            </div>

          </motion.div>

          {/* سمت چپ: فرم ارسال پیام */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white p-8 sm:p-10 rounded-[3rem] shadow-sm border border-gray-100"
          >
            <h2 className="text-2xl font-bold text-text-dark mb-6">برای ما پیام بفرستید</h2>
            <form className="flex flex-col gap-6 font-sans">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-text-dark">نام و نام خانوادگی</label>
                  <input type="text" placeholder="نام خود را وارد کنید" className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-pink/50" />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-text-dark">شماره موبایل</label>
                  <input type="tel" placeholder="۰۹xxxxxxxxx" className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 text-left" dir="ltr" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-dark">موضوع پیام</label>
                <select className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 appearance-none">
                  <option>پشتیبانی سفارشات</option>
                  <option>درخواست سفارش اختصاصی</option>
                  <option>پیشنهاد همکاری</option>
                  <option>انتقادات و پیشنهادات</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-dark">متن پیام</label>
                <textarea rows={5} placeholder="پیام خود را اینجا بنویسید..." className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-2xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 resize-none"></textarea>
              </div>

              <button type="button" className="bg-primary-pink text-white flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:bg-pink-500 transition-all mt-2 w-full sm:w-auto sm:px-12 self-end">
                <Send className="w-5 h-5" />
                ارتباط با تیم
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}