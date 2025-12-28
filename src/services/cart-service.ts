import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// تعریف تایپ برای خروجی سبد خرید که شامل روابط باشد
export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
        variant: true;
      };
    };
  };
}>;

export const cartService = {
  /**
   * دریافت سبد خرید بر اساس اولویت (اول یوزر، بعد مهمان)
   */
  async getCart(
    userId?: string,
    sessionCartId?: string
  ): Promise<CartWithItems | null> {
    if (userId) {
      return await db.cart.findUnique({
        where: { userId },
        include: { items: { include: { product: true, variant: true } } },
      });
    }

    if (sessionCartId) {
      return await db.cart.findFirst({
        where: { sessionCartId },
        include: { items: { include: { product: true, variant: true } } },
      });
    }

    return null;
  },

  /**
   * ساخت سبد خرید جدید (برای کاربر یا مهمان)
   */
  async createCart(userId?: string, sessionCartId?: string) {
    if (userId) {
      return await db.cart.create({
        data: { userId },
        include: { items: { include: { product: true, variant: true } } },
      });
    }
    if (sessionCartId) {
      return await db.cart.create({
        data: { sessionCartId },
        include: { items: { include: { product: true, variant: true } } },
      });
    }
    throw new Error(
      "برای ساخت سبد خرید، شناسه کاربر یا شناسه مهمان الزامی است."
    );
  },

  /**
   * 🔥 عملیات حیاتی ادغام سبد مهمان در سبد کاربر (Merge Logic)
   * این تابع باید بعد از لاگین موفق صدا زده شود.
   */
  async mergeCarts(userId: string, sessionCartId: string) {
    // ۱. دریافت سبد مهمان
    const guestCart = await db.cart.findFirst({
      where: { sessionCartId },
      include: { items: true },
    });

    if (!guestCart || guestCart.items.length === 0) return;

    // ۲. دریافت یا ساخت سبد کاربر
    let userCart = await db.cart.findUnique({
      where: { userId },
      include: { items: true },
    });

    if (!userCart) {
      userCart = await db.cart.create({
        data: { userId },
        include: { items: true },
      });
    }

    // ۳. اجرای عملیات ادغام در یک تراکنش امن دیتابیس
    await db.$transaction(async (tx) => {
      for (const item of guestCart.items) {
        // آیا این محصول با همین واریانت قبلا در سبد کاربر بوده؟
        const existingItem = userCart!.items.find(
          (ui) =>
            ui.productId === item.productId && ui.variantId === item.variantId
        );

        if (existingItem) {
          // اگر هست، تعداد را جمع کن
          await tx.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + item.quantity },
          });
        } else {
          // اگر نیست، منتقل کن
          await tx.cartItem.create({
            data: {
              cartId: userCart!.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
            },
          });
        }
      }

      // ۴. حذف سبد مهمان (Cleanup)
      await tx.cart.delete({ where: { id: guestCart.id } });
    });
  },

  /**
   * محاسبه موجودی قابل خرید برای یک محصول خاص
   */
  async checkStock(productId: string, variantId?: string | null) {
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) return 0;

    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      return variant ? variant.stock : 0;
    }

    return product.stock;
  },

  /**
   * پاک کردن کامل سبد خرید کاربر
   */
  async clearCart(cartId: string) {
    await db.cartItem.deleteMany({
      where: { cartId },
    });
  },
};
