"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, Image as ImageIcon, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import QuickAddToCartButton from "./QuickAddToCartButton";

export default function ShopClient({ initialProducts, initialCategories }: { initialProducts: any[], initialCategories: any[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  // اعمال فیلترها و مرتب‌سازی داینامیک در سمت کلاینت
  const filteredProducts = initialProducts
    .filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category_id === activeCategory;
      const matchesSearch = product.title.includes(searchQuery);
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      
      // پیش‌فرض: جدیدترین‌ها (بر اساس تاریخ ساخت نزولی)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
      {/* بار فیلترها و جستجو */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col lg:flex-row gap-4 justify-between items-center mb-10 z-10 relative">
        
        {/* دکمه‌های دسته‌بندی */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-2 w-full lg:w-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-5 py-2 rounded-full font-bold font-sans text-sm transition-all cursor-pointer ${
              activeCategory === "all" 
                ? "bg-primary-pink text-white shadow-md" 
                : "bg-gray-50 text-text-dark/70 hover:bg-gray-100"
            }`}
          >
            همه محصولات
          </button>
          
          {initialCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2 rounded-full font-bold font-sans text-sm transition-all cursor-pointer ${
                activeCategory === category.id 
                  ? "bg-primary-pink text-white shadow-md" 
                  : "bg-gray-50 text-text-dark/70 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* بخش ابزارهای سمت چپ (جستجو + مرتب‌سازی) */}
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-center">
          
          {/* منوی مرتب‌سازی حرفه‌ای */}
          <div className="relative w-full sm:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-full py-2.5 pr-4 pl-10 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 font-sans text-sm cursor-pointer appearance-none"
            >
              <option value="newest">جدیدترین محصولات</option>
              <option value="price-asc">قیمت: از کم به زیاد</option>
              <option value="price-desc">قیمت: از زیاد به کم</option>
            </select>
            <SlidersHorizontal className="w-4 h-4 text-gray-400 absolute left-4 top-3.5 pointer-events-none" />
          </div>

          {/* فیلد جستجو */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="جستجوی محصول..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-full py-2.5 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 font-sans text-sm"
            />
            <Search className="w-5 h-5 text-gray-400 absolute right-3 top-3" />
          </div>

        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-3xl p-4 border-2 border-transparent hover:border-primary-pink/20 shadow-sm hover:shadow-xl transition-all group relative flex flex-col justify-between"
              >
                <Link href={`/shop/${product.id}`}>
                  <div className="w-full aspect-square rounded-2xl bg-soft-blue/10 flex items-center justify-center mb-4 relative overflow-hidden cursor-pointer">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <ImageIcon className="w-16 h-16 text-soft-blue opacity-50 group-hover:scale-110 transition-transform duration-500" />
                    )}
                    
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <span className="text-xs font-bold text-text-dark mt-1">۵.۰</span>
                      <Star className="w-3 h-3 text-soft-yellow fill-soft-yellow" />
                    </div>
                  </div>
                </Link>

                <div className="text-right flex-grow">
                  <Link href={`/shop/${product.id}`}>
                    <h3 className="text-lg font-bold text-text-dark mb-1 truncate hover:text-primary-pink transition-colors">
                      {product.title}
                    </h3>
                  </Link>
                  {product.categories && (
                    <p className="text-xs text-gray-400 mb-3 font-sans">{product.categories.name}</p>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-50">
                  <div className="text-primary-pink font-bold flex gap-1 items-center">
                    <span>{product.price.toLocaleString("fa-IR")}</span>
                    <span className="text-xs text-text-dark/50">تومان</span>
                  </div>
                  
                  {/* فراخوانی دکمه هوشمند سبد خرید که مشکل رو حل می‌کنه */}
                  <QuickAddToCartButton product={product} />
                  
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
          <SlidersHorizontal className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-text-dark mb-2">محصولی پیدا نشد!</h3>
          <p className="text-gray-500 font-sans">فعلاً در این دسته‌بندی محصولی نداریم یا جستجوی خود را تغییر دهید.</p>
        </motion.div>
      )}
    </div>
  );
}