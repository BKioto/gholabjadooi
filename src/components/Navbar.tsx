"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // خواندن مسیر فعلی مرورگر
  const pathname = usePathname(); 

  const toggleMenu = () => setIsOpen(!isOpen);

  // دریافت تعداد محصولات سبد خرید
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  const navLinks = [
    { name: "صفحه اصلی", path: "/" },
    { name: "فروشگاه", path: "/shop" },
    { name: "درباره ما", path: "/about" },
    { name: "سوالات متداول", path: "/faq" },
    { name: "تماس با ما", path: "/contact" },
  ];

  return (
    <nav className="bg-white/85 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* لوگو اختصاصی و نام برند */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="rounded-2xl group-hover:shadow-md transition-all overflow-hidden w-11 h-11 border border-gray-100 shrink-0 bg-white">
              <img src="/logo.png" alt="لوگوی قلاب جادویی" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-display text-2xl text-primary-pink font-bold tracking-wide">قلاب جادویی</span>
          </Link>

          {/* منوی دسکتاپ هوشمند */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => {
              // جادوی هوشمند: اگر در صفحه اصلی هستیم، لینک صفحه اصلی مخفی می‌شود
              if (pathname === '/' && link.path === '/') return null;
              
              // تشخیص صفحه فعال برای سایر لینک‌ها
              const isActive = pathname === link.path || (link.path !== '/' && pathname.startsWith(link.path));

              return (
                <Link 
                  key={index} 
                  href={link.path}
                  className={`font-sans font-bold transition-colors text-sm lg:text-base relative group py-2 ${
                    isActive ? "text-primary-pink" : "text-text-dark/70 hover:text-primary-pink"
                  }`}
                >
                  {link.name}
                  {/* خط زیرین متحرک برای نشان دادن صفحه فعال */}
                  {isActive && (
                    <motion.div 
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-primary-pink rounded-t-full"
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* بخش سمت چپ: سبد خرید و منوی موبایل */}
          <div className="flex items-center gap-4">
            
            {/* دکمه سبد خرید */}
            <Link href="/cart" className="relative p-3 bg-gray-50 rounded-2xl hover:bg-primary-pink/10 transition-colors group border border-gray-100 hover:border-primary-pink/30 shadow-sm">
              <img src="https://api.iconify.design/fluent/shopping-bag-24-filled.svg?color=%23374151" alt="سبد خرید" className="w-6 h-6 group-hover:scale-110 transition-transform" />
              
              {mounted && totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary-pink text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-md animate-bounce">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* دکمه همبرگری موبایل */}
            <button 
              className="md:hidden p-3 text-text-dark bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-100"
              onClick={toggleMenu}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
          </div>

        </div>
      </div>

      {/* منوی بازشونده موبایل */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-gray-100 overflow-hidden shadow-2xl absolute w-full"
          >
            <div className="px-4 pt-4 pb-8 flex flex-col gap-3">
              {navLinks.map((link, index) => {
                // در موبایل هم اگر خانه هستیم، کشوی خانه مخفی شود
                if (pathname === '/' && link.path === '/') return null;
                const isActive = pathname === link.path;

                return (
                  <Link 
                    key={index} 
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`font-sans font-bold p-4 rounded-2xl transition-all block text-right border ${
                      isActive 
                        ? "bg-primary-pink/10 text-primary-pink border-primary-pink/20 shadow-inner" 
                        : "bg-gray-50 text-text-dark/80 hover:bg-gray-100 border-transparent"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}