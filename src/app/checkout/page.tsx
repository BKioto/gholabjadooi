// مسیر فایل: src/app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, MapPin, Phone, CreditCard, ShieldCheck, Truck, Loader2, CheckCircle2, Copy, Info } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { supabase } from "@/lib/supabase";

export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [bankInfo, setBankInfo] = useState({ cardNumber: '', cardOwnerName: '' });

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    postalCode: ""
  });

  const { items, getTotalPrice, clearCart } = useCartStore();

  useEffect(() => {
    setMounted(true);
    if (items.length === 0 && !isSuccess) {
      router.push('/shop');
    }
    
    const fetchBankInfo = async () => {
      const { data } = await supabase.from('store_settings').select('card_number, card_owner_name').eq('id', 1).single();
      if (data) {
        setBankInfo({ cardNumber: data.card_number || '', cardOwnerName: data.card_owner_name || '' });
      }
    };
    fetchBankInfo();

  }, [items, router, isSuccess]);

  if (!mounted) return null;

  const subtotal = getTotalPrice();
  const packagingCost = items.length > 0 ? 50000 : 0; // 👈 هزینه بسته‌بندی
  const total = subtotal + packagingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = () => {
    if (bankInfo.cardNumber) {
      navigator.clipboard.writeText(bankInfo.cardNumber);
      alert('شماره کارت کپی شد.');
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      alert("لطفاً فیلدهای ضروری (نام، موبایل و آدرس) را پر کنید.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            customer_name: formData.name,
            customer_phone: formData.phone,
            customer_address: formData.address,
            postal_code: formData.postalCode,
            total_amount: total,
            status: 'pending'
          }
        ])
        .select('id')
        .single();

      if (orderError) throw orderError;

      const orderId = orderData.id;

      const orderItemsToInsert = items.map(item => ({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price,
        selected_color: item.color || null
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsToInsert);

      if (itemsError) throw itemsError;

      setIsSuccess(true);
      clearCart();
      
      setTimeout(() => {
        router.push('/');
      }, 4000);

    } catch (error) {
      console.error("خطا در ثبت سفارش:", error);
      alert("متأسفانه مشکلی در ثبت سفارش پیش آمد. لطفاً دوباره تلاش کنید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center py-12 px-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-gray-100 text-center max-w-lg w-full"
        >
          <div className="w-24 h-24 bg-mint-green/20 text-mint-green rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-display text-text-dark mb-4">سفارش با موفقیت ثبت شد!</h2>
          <p className="text-gray-500 font-sans leading-relaxed mb-8">
            تیم حرفه‌ای ما به زودی آماده‌سازی شاهکارهای شما را آغاز خواهد کرد. از اعتماد شما سپاسگزاریم.
          </p>
          <div className="text-sm text-gray-400 font-sans">
            در حال انتقال به صفحه اصلی...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-display text-text-dark mb-2">تکمیل اطلاعات سفارش</h1>
          <p className="text-gray-500 font-sans">لطفاً مشخصات پستی خود را با دقت وارد کنید.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-2/3 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100"
          >
            <h2 className="text-xl font-bold text-text-dark mb-6 border-b border-gray-50 pb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary-pink" />
              آدرس و مشخصات تحویل‌گیرنده
            </h2>

            <form id="checkout-form" onSubmit={handleSubmitOrder} className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-dark">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="مثال: علی رضایی" 
                    className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-pink/50" 
                  />
                  <User className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-dark">شماره موبایل <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹" 
                    className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-xl py-3 pr-10 pl-4 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 text-left" 
                    dir="ltr" 
                  />
                  <Phone className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
                </div>
              </div>

              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-sm font-bold text-text-dark">آدرس دقیق پستی <span className="text-red-500">*</span></label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3} 
                  placeholder="استان، شهر، خیابان، کوچه، پلاک، واحد" 
                  className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-dark">کد پستی (۱۰ رقمی)</label>
                <input 
                  type="text" 
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="1234567890" 
                  className="w-full bg-gray-50 border border-gray-200 text-text-dark rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-primary-pink/50 text-left" 
                  dir="ltr" 
                />
              </div>
            </form>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-1/3 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 sticky top-24"
          >
            <h3 className="text-xl font-bold text-text-dark mb-6 border-b border-gray-50 pb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-soft-blue" />
              فاکتور و واریز وجه
            </h3>
            
            <div className="flex flex-col gap-4 font-sans text-text-dark/80 mb-4 border-b border-gray-100 pb-4">
              <div className="flex justify-between items-center">
                <span>مبلغ محصولات:</span>
                <span className="font-bold text-text-dark">{subtotal.toLocaleString("fa-IR")} تومان</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>هزینه ایمن‌سازی و بسته‌بندی:</span>
                <span className="font-bold text-text-dark">{packagingCost.toLocaleString("fa-IR")} تومان</span>
              </div>
              <div className="flex justify-between items-center mt-2 pt-4 border-t border-gray-100">
                <span className="text-lg font-bold text-text-dark">مبلغ قابل پرداخت سایت:</span>
                <span className="text-xl font-bold text-primary-pink">{total.toLocaleString("fa-IR")} تومان</span>
              </div>
            </div>

            {/* 👈 باکس هشدار محترمانه برای پس‌کرایه */}
            <div className="mb-6 bg-red-50/80 border border-red-100 rounded-2xl p-4 flex items-start gap-3 text-sm text-red-500 font-sans leading-relaxed shadow-sm">
              <Info className="w-5 h-5 shrink-0 mt-0.5 text-red-400" />
              <p>
                <strong>توجه:</strong> کرایه پستی به صورت <strong>پس‌کرایه</strong> می‌باشد؛ یعنی هزینه ارسال را هنگام دریافت بسته، درب منزل به مامور پست پرداخت خواهید کرد.
              </p>
            </div>

            <div className="bg-soft-blue/10 border border-soft-blue/30 rounded-2xl p-4 mb-6">
              <p className="text-sm text-text-dark font-bold mb-3 text-center">
                لطفاً مبلغ فاکتور را به کارت زیر واریز کنید:
              </p>
              
              <div className="bg-white p-3 rounded-xl border border-gray-100 mb-2 flex items-center justify-between">
                <button type="button" onClick={copyToClipboard} className="text-gray-400 hover:text-primary-pink transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
                <span className="font-bold text-lg tracking-widest text-text-dark" dir="ltr">
                  {bankInfo.cardNumber || 'در حال بارگذاری...'}
                </span>
              </div>
              
              <div className="text-center font-sans text-sm text-gray-500">
                به نام: <span className="font-bold text-text-dark">{bankInfo.cardOwnerName || 'در حال بارگذاری...'}</span>
              </div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className="w-full bg-mint-green text-text-dark flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70 disabled:hover:scale-100"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  در حال بررسی...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-6 h-6" />
                  وجه را واریز کردم (ثبت نهایی)
                </>
              )}
            </button>

            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 font-sans bg-gray-50 p-3 rounded-xl">
                <Truck className="w-5 h-5 text-soft-yellow shrink-0" />
                <span>ارسال سریع و مطمئن توسط تیم هنرمندان ما</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}