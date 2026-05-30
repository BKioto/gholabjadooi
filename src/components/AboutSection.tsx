"use client";

import { motion } from "framer-motion";
import { Heart, Star, ShieldCheck, Smile } from "lucide-react";

export default function AboutSection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-display text-text-dark mb-4">
            درباره <span className="text-primary-pink">قلاب جادویی</span>
          </h2>
          <p className="text-lg font-sans text-gray-500 max-w-2xl mx-auto">
            ما یک تیم حرفه‌ای از هنرمندان بافنده هستیم که با ترکیب هنر، عشق و کاموا، رویاهای فانتزی شما را به واقعیت تبدیل می‌کنیم.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-primary-pink/5 border border-primary-pink/10 p-8 rounded-[2rem] text-center hover:bg-primary-pink/10 transition-colors"
          >
            <div className="w-16 h-16 mx-auto bg-primary-pink/20 text-primary-pink rounded-full flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 fill-primary-pink" />
            </div>
            <h3 className="font-bold text-xl text-text-dark mb-3">بافته شده با عشق</h3>
            <p className="text-gray-500 font-sans text-sm leading-relaxed">
              تک‌تک گره‌های محصولات ما توسط دستان هنرمندان تیم، با دقت، ظرافت و عشق فراوان زده می‌شود.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-soft-blue/10 border border-soft-blue/20 p-8 rounded-[2rem] text-center hover:bg-soft-blue/20 transition-colors"
          >
            <div className="w-16 h-16 mx-auto bg-soft-blue text-blue-600 rounded-full flex items-center justify-center mb-6">
              <Star className="w-8 h-8 fill-blue-600" />
            </div>
            <h3 className="font-bold text-xl text-text-dark mb-3">کیفیت تضمینی</h3>
            <p className="text-gray-500 font-sans text-sm leading-relaxed">
              استفاده از بهترین الیاف ضدحساسیت و کامواهای ترک، ماندگاری و لطافت محصولات را تضمین می‌کند.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-mint-green/20 border border-mint-green/30 p-8 rounded-[2rem] text-center hover:bg-mint-green/30 transition-colors"
          >
            <div className="w-16 h-16 mx-auto bg-mint-green text-green-600 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-text-dark mb-3">خرید امن و سریع</h3>
            <p className="text-gray-500 font-sans text-sm leading-relaxed">
              بسته‌بندی ایمن و ارسال سریع به سراسر ایران، تا سفارش شما در بهترین حالت به دستتان برسد.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="bg-soft-yellow/30 border border-soft-yellow/40 p-8 rounded-[2rem] text-center hover:bg-soft-yellow/50 transition-colors"
          >
            <div className="w-16 h-16 mx-auto bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6">
              <Smile className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl text-text-dark mb-3">رضایت مشتریان</h3>
            <p className="text-gray-500 font-sans text-sm leading-relaxed">
              بزرگترین افتخار تیم ما، لبخندی است که با دیدن محصولات ما روی لب‌های شما و عزیزانتان می‌نشیند.
            </p>
          </motion.div>

        </div>
      </div>
    </section>
  );
}