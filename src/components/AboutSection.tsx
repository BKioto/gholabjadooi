"use client";

import { motion } from "framer-motion";
import { Heart, Sparkles, ShieldCheck, Smile } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-[#fafafa]">
      {/* هاله‌های نوری پس‌زمینه برای ایجاد عمق سه‌بعدی */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-pink/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-soft-blue/20 rounded-full blur-[100px] -z-10"></div>
      
      {/* پترن نقطه‌ای محو در پس‌زمینه */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20 relative">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-5 py-2.5 rounded-full border border-gray-100 shadow-sm mb-6"
          >
            <Sparkles className="w-5 h-5 text-primary-pink" />
            <span className="text-sm font-bold text-text-dark/80">داستان خلق یک رویا</span>
          </motion.div>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display text-text-dark mb-6 drop-shadow-sm">
            درباره <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-pink to-purple-500">قلاب جادویی</span>
          </h2>
          <p className="text-lg sm:text-xl font-sans text-gray-500 max-w-3xl mx-auto leading-relaxed">
            ما یک تیم حرفه‌ای از هنرمندان بافنده هستیم که با ترکیب هنر، عشق و کاموا، رویاهای فانتزی شما را به واقعیت تبدیل می‌کنیم.
          </p>
        </div>

        {/* شروع طراحی Bento Grid (شبکه نامتقارن و مدرن) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 max-w-6xl mx-auto">
          
          {/* کارت اول: بزرگ و پهن (ترکیب عشق و هنر) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-8 bg-white/40 backdrop-blur-xl border border-white/60 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-pink/10 rounded-full blur-3xl -z-10 group-hover:bg-primary-pink/20 transition-colors duration-700"></div>
            
            {/* حباب شیشه‌ای برای آیکون */}
            <div className="w-20 h-20 bg-gradient-to-br from-primary-pink/20 to-white/50 backdrop-blur-md border border-white rounded-3xl flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Heart className="w-10 h-10 text-primary-pink drop-shadow-md" />
            </div>
            
            <h3 className="font-display text-3xl text-text-dark mb-4">بافته شده با تمامِ عشق</h3>
            <p className="text-gray-500 font-sans text-base sm:text-lg leading-relaxed max-w-xl">
              تک‌تک گره‌های محصولات ما توسط دستان هنرمندان تیم، با ساعت‌ها دقت، ظرافت و عشق فراوان زده می‌شود تا اثری ماندگار و روح‌دار خلق شود.
            </p>
          </motion.div>

          {/* کارت دوم: عمودی و کوچک‌تر (کیفیت) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="md:col-span-4 bg-gradient-to-br from-soft-blue/10 to-transparent backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 group"
          >
            <div className="w-16 h-16 bg-white/60 backdrop-blur-md border border-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-all duration-500">
              <Sparkles className="w-8 h-8 text-blue-500 drop-shadow-md" />
            </div>
            <h3 className="font-bold text-2xl text-text-dark mb-4">کیفیت تضمینی</h3>
            <p className="text-gray-500 font-sans text-sm sm:text-base leading-relaxed">
              استفاده از بهترین الیاف ضدحساسیت و کامواهای اورجینال ترک، ماندگاری و لطافت بی‌نظیر محصولات را تضمین می‌کند.
            </p>
          </motion.div>

          {/* کارت سوم: عمودی و کوچک‌تر (ارسال) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="md:col-span-4 bg-gradient-to-br from-mint-green/10 to-transparent backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 group"
          >
            <div className="w-16 h-16 bg-white/60 backdrop-blur-md border border-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-all duration-500">
              <ShieldCheck className="w-8 h-8 text-green-600 drop-shadow-md" />
            </div>
            <h3 className="font-bold text-2xl text-text-dark mb-4">خرید امن و سریع</h3>
            <p className="text-gray-500 font-sans text-sm sm:text-base leading-relaxed">
              بسته‌بندی فوق‌العاده ایمن و لاکچری به همراه ارسال سریع به سراسر ایران، تا سفارش شما در بهترین حالت به دستتان برسد.
            </p>
          </motion.div>

          {/* کارت چهارم: بزرگ و پهن (رضایت مشتری) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-8 bg-white/40 backdrop-blur-xl border border-white/60 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500 group relative overflow-hidden flex flex-col justify-center"
          >
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-soft-yellow/20 rounded-full blur-3xl -z-10 group-hover:bg-soft-yellow/30 transition-colors duration-700"></div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
              <div className="w-20 h-20 shrink-0 bg-gradient-to-br from-soft-yellow/30 to-white/50 backdrop-blur-md border border-white rounded-3xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                <Smile className="w-10 h-10 text-orange-400 drop-shadow-md" />
              </div>
              <div>
                <h3 className="font-display text-3xl text-text-dark mb-4">لبخند رضایت شما</h3>
                <p className="text-gray-500 font-sans text-base sm:text-lg leading-relaxed max-w-lg">
                  بزرگترین افتخار تیم ما، لبخندی است که با باز کردن جعبه‌های جادویی ما و دیدن محصولات، روی لب‌های شما و عزیزانتان می‌نشیند.
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}