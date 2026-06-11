import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// تعریف ساختار هر محصول در سبد خرید
export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  color?: string; // 👈 این فیلد برای رنگ اضافه شد (اختیاری)
  cartItemId: string; // 👈 شناسه یکتا برای جلوگیری از تداخل محصولات هم‌نام با رنگ متفاوت
}

// تعریف ساختار کل حافظه سبد خرید
interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'cartItemId'>) => void;
  removeFromCart: (cartItemId: string) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

// ساخت سیستم مدیریت وضعیت (State Management)
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      
      // اضافه کردن محصول به سبد
      addToCart: (item) => {
        const currentItems = get().items;
        // تولید شناسه یکتا: اگر رنگ داشت ترکیب آیدی و رنگ، اگر نداشت همون آیدی
        const uniqueId = item.color ? `${item.id}-${item.color}` : item.id;
        
        const existingItem = currentItems.find((i) => i.cartItemId === uniqueId);
        
        if (existingItem) {
          // اگر دقیقاً همین محصول با همین رنگ از قبل بود، فقط تعدادش رو ببر بالا
          set({
            items: currentItems.map((i) =>
              i.cartItemId === uniqueId ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
          });
        } else {
          // اگر نبود، به عنوان آیتم جدید با شناسه یکتا اضافه‌اش کن
          set({ items: [...currentItems, { ...item, cartItemId: uniqueId }] });
        }
      },
      
      // حذف کامل یک محصول از سبد بر اساس شناسه یکتا
      removeFromCart: (cartItemId) => {
        set({ items: get().items.filter((i) => i.cartItemId !== cartItemId) });
      },
      
      // زیاد کردن تعداد یک محصول
      increaseQuantity: (cartItemId) => {
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        });
      },
      
      // کم کردن تعداد یک محصول
      decreaseQuantity: (cartItemId) => {
        set({
          items: get().items.map((i) =>
            i.cartItemId === cartItemId && i.quantity > 1 ? { ...i, quantity: i.quantity - 1 } : i
          ),
        });
      },
      
      // خالی کردن کل سبد خرید (بعد از پرداخت موفق)
      clearCart: () => set({ items: [] }),
      
      // محاسبه قیمت کل سبد خرید
      getTotalPrice: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      // محاسبه تعداد کل آیتم‌های داخل سبد
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: 'gholabjadooi-cart-storage', // اسمی که در حافظه مرورگر کاربر ذخیره میشه
    }
  )
);