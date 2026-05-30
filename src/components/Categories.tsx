"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export default function Categories({ categories }: { categories: Category[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-display text-text-dark mb-4">
          دسته‌بندی محصولات
        </h2>
        <p className="text-base sm:text-lg font-sans text-text-dark/70">
          برای مشاهده محصولات، روی دسته‌بندی مورد نظر خود کلیک کنید
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
        {categories?.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={`/category/${category.slug}`} className="block h-full w-full">
              {/* کارت به صورت مربع/مستطیل کشیده و تمام‌عکس تنظیم شد */}
              <motion.div
                whileHover={{ y: -5 }}
                className="relative w-full aspect-square sm:aspect-[4/5] rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl bg-gray-100 group"
              >
                {/* عکس به صورت مطلق کل فضای کارت را پر می‌کند */}
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 z-0"
                  />
                ) : (
                  <div className="absolute inset-0 w-full h-full bg-primary-pink/20 z-0"></div>
                )}
                
                {/* یک لایه گرادینت مشکی از پایین به بالا برای خوانایی کامل متن‌ها روی عکس */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                
                {/* متون و دکمه راهنما که در پایین کارت روی عکس قرار می‌گیرند */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-end p-4 sm:p-6 text-center">
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 drop-shadow-md">
                    {category.name}
                  </h3>
                  
                  <p className="text-white/90 font-sans text-[10px] sm:text-sm font-bold translate-y-0 lg:translate-y-4 opacity-100 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100 transition-all duration-300">
                    مشاهده محصولات &larr;
                  </p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}