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

      {/* تغییر به grid-cols-2 برای موبایل و فاصله‌های بهینه‌تر */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
        {categories?.map((category, index) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={`/category/${category.slug}`} className="block h-full">
              <motion.div
                whileHover={{ y: -10 }}
                className="flex flex-col items-center text-center p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] cursor-pointer border-2 border-transparent hover:border-primary-pink/30 transition-all shadow-sm hover:shadow-xl bg-white h-full group"
              >
                {/* سایز عکس‌ها اینجا دقیقا بزرگتر شد بدون اینکه کارت تغییر سایز بده! 
                  از w-20 به w-24 در موبایل، و در دسکتاپ تا w-52 بزرگ میشه تا کامل فضای کارت رو بگیره.
                */}
                <div className="w-24 h-24 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 flex items-center justify-center rounded-full mb-4 sm:mb-6 overflow-hidden border-2 sm:border-4 border-gray-50 shadow-inner group-hover:scale-105 transition-transform duration-500 bg-soft-blue/10">
                  {category.image ? (
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary-pink/20"></div>
                  )}
                </div>
                
                <h3 className="text-sm sm:text-2xl font-bold text-text-dark mb-1 sm:mb-2">
                  {category.name}
                </h3>
                
                {/* در موبایل همیشه نمایش داده میشه، در دسکتاپ با هاور */}
                <p className="text-primary-pink font-sans text-[10px] sm:text-sm font-bold opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity mt-1 sm:mt-2">
                  مشاهده &larr;
                </p>
              </motion.div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}