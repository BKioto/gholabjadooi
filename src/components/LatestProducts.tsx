"use client";

import { motion } from "framer-motion";
import { Star, Image as ImageIcon, Sparkles } from "lucide-react";
import Link from "next/link";
import QuickAddToCartButton from "./QuickAddToCartButton";

export default function LatestProducts({ products }: { products: any[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-soft-blue/10 rounded-[3rem] my-8 border border-soft-blue/30 shadow-sm">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary-pink/10 text-primary-pink px-4 py-2 rounded-full mb-4 shadow-sm">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold text-sm">تازه‌های تنور قلاب جادویی</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-display text-text-dark mb-4">
          جدیدترین دست‌بافت‌ها
        </h2>
        <p className="text-base sm:text-lg font-sans text-text-dark/70">
          آثاری که همین روزها توسط تیم هنرمندان ما خلق شده‌اند
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
        {products?.slice(0, 4).map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border-2 border-transparent hover:border-primary-pink/20 shadow-sm hover:shadow-xl transition-all group relative flex flex-col"
          >
            {/* بج جدید بودن محصول */}
            <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl rounded-tl-sm rounded-br-sm shadow-lg z-20 animate-pulse">
              جدید ✨
            </div>

            <Link href={`/shop/${product.id}`} className="block relative">
              <div className="w-full aspect-square rounded-xl sm:rounded-2xl bg-soft-blue/10 flex items-center justify-center mb-3 sm:mb-4 relative overflow-hidden cursor-pointer">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <ImageIcon className="w-10 h-10 sm:w-16 sm:h-16 text-soft-blue opacity-50 group-hover:scale-110 transition-transform duration-500" />
                )}
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg flex items-center gap-1 shadow-sm">
                  <span className="text-[10px] sm:text-xs font-bold text-text-dark mt-0.5 sm:mt-1">۵.۰</span>
                  <Star className="w-2 h-2 sm:w-3 sm:h-3 text-soft-yellow fill-soft-yellow" />
                </div>
              </div>
            </Link>

            <div className="text-right flex flex-col flex-grow">
              <Link href={`/shop/${product.id}`}>
                <h3 className="text-sm sm:text-lg font-bold text-text-dark mb-1 truncate hover:text-primary-pink transition-colors line-clamp-1">
                  {product.title}
                </h3>
              </Link>
              {product.categories && (
                <p className="text-[10px] sm:text-xs text-gray-400 mb-2 sm:mb-3 font-sans truncate">{product.categories.name}</p>
              )}
              
              <div className="flex justify-between items-center mt-auto pt-3 sm:pt-4 border-t border-gray-50">
                <div className="text-primary-pink font-bold flex flex-col sm:flex-row sm:gap-1 items-start sm:items-center leading-tight">
                  <span className="text-sm sm:text-base">{product.price.toLocaleString("fa-IR")}</span>
                  <span className="text-[9px] sm:text-xs text-text-dark/50">تومان</span>
                </div>
                
                <QuickAddToCartButton product={product} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}