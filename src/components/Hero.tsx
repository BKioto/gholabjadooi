"use client";

import { motion } from "framer-motion";
import { ShoppingBag, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 overflow-hidden relative">
      
      {/* هاله‌های نوری محو در پس‌زمینه برای ایجاد عمق و حس جادویی */}
      <div className="absolute top-10 right-10 w-72 h-72 bg-primary-pink/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-mint-green/20 rounded-full blur-3xl -z-10"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[70vh]">
        
        {/* سمت راست: محتوا، متن‌ها و دکمه‌ها */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 text-center md:text-right z-10"
        >
          <div className="inline-flex items-center gap-2 bg-soft-yellow/80 text-text-dark px-4 py-2 rounded-full w-fit mx-auto md:mx-0 shadow-sm border border-soft-yellow/50">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold">جدیدترین کالکشن دست‌بافت‌ها</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display text-primary-pink leading-tight drop-shadow-sm">
            دنیای فانتزی <br />
            <span className="text-text-dark">قلاب جادویی</span>
          </h1>
          
          <p className="text-lg sm:text-xl font-sans text-text-dark/80 leading-relaxed max-w-lg mx-auto md:mx-0">
            زیباترین عروسک‌های کاموایی و باکس‌های گل جادویی که توسط یک تیم حرفه‌ای برای شما بافته شده‌اند. هدیه‌ای بی‌نظیر که هرگز پژمرده نمی‌شود!
          </p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6 relative">
            
            {/* دکمه اصلی و حرفه‌ای ورود به فروشگاه */}
            <Link href="/shop" className="relative group block">
              
              {/* افکت نوری (Glow) پشت دکمه با انیمیشن تپش */}
              <div className="absolute -inset-1 bg-primary-pink rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500 animate-pulse"></div>
              
              <motion.div 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="relative bg-primary-pink text-white px-10 py-4 rounded-full font-bold shadow-xl flex items-center gap-3 overflow-hidden border border-white/20"
              >
                {/* افکت شاین (برق زدن) که با هاور از روی دکمه رد میشه */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 ease-in-out"></div>
                
                <ShoppingBag className="w-6 h-6 relative z-10" />
                <span className="text-lg relative z-10 text-white">مشاهده محصولات</span>
              </motion.div>

            </Link>

          </div>
        </motion.div>

        {/* سمت چپ: تصویر خفن و واقعی */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative flex justify-center items-center"
        >
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="w-72 h-72 sm:w-96 sm:h-96 bg-mint-green rounded-full flex justify-center items-center shadow-xl relative border-8 border-white"
          >
             <Image 
               src="/hero-banner.png" 
               alt="بافتنی فانتزی قلاب جادویی" 
               width={380} 
               height={380} 
               className="object-contain drop-shadow-2xl z-10 hover:scale-110 transition-transform duration-500"
               priority 
             />
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}