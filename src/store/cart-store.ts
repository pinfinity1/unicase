// src/store/cart-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// تایپ محصولی که در سبد خرید قرار می‌گیرد
export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number; // تعداد سفارش از این محصول
  maxStock: number; // برای جلوگیری از سفارش بیشتر از موجودی
}

interface CartState {
  items: CartItem[];

  // اکشن‌ها
  addItem: (product: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // محاسباتی (Getters)
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (item) => item.id === product.id
        );

        if (existingItem) {
          // اگر محصول وجود دارد، فقط تعدادش را زیاد کن (با چک کردن موجودی انبار)
          if (existingItem.quantity < existingItem.maxStock) {
            set({
              items: currentItems.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            });
          }
        } else {
          // اگر محصول جدید است، آن را اضافه کن
          set({ items: [...currentItems, { ...product, quantity: 1 }] });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        const currentItems = get().items;
        set({
          items: currentItems.map((item) => {
            if (item.id === productId) {
              // محدودیت: تعداد نباید کمتر از ۱ و بیشتر از موجودی انبار باشد
              const newQuantity = Math.max(
                1,
                Math.min(quantity, item.maxStock)
              );
              return { ...item, quantity: newQuantity };
            }
            return item;
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "unicase-cart-storage", // نام کلید در LocalStorage
      storage: createJSONStorage(() => localStorage), // ذخیره‌سازی سمت کلاینت
      // نکته: برای جلوگیری از ارور Hydration در نکست جی‌اس، skipHydration را می‌توان استفاده کرد
      // اما راه بهتر استفاده از یک هوک کاستوم است که در ادامه می‌گویم.
    }
  )
);
