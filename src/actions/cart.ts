"use server";

import { cartService } from "@/services/cart-service"; // 👈 استفاده از سرویس جدید
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cookies } from "next/headers";

// تابعی کمکی برای گرفتن شناسه کاربر یا مهمان
async function getCartContext() {
  const session = await auth();
  const cookieStore = await cookies();
  const sessionCartId = cookieStore.get("cartId")?.value;

  return {
    userId: session?.user?.id,
    sessionCartId,
    cookieStore,
  };
}

// ۱. افزودن به سبد خرید
export async function addToCartAction(productId: string, variantId?: string) {
  try {
    const { userId, sessionCartId, cookieStore } = await getCartContext();

    // ۱. دریافت یا ساخت سبد خرید
    let cart = await cartService.getCart(userId, sessionCartId);

    // اگر سبد وجود نداشت، باید بسازیم
    if (!cart) {
      if (userId) {
        // برای کاربر لاگین شده
        cart = await cartService.createCart(userId);
      } else {
        // برای کاربر مهمان (ساخت کوکی)
        const newSessionId =
          Math.random().toString(36).substring(7) + Date.now();
        cart = await cartService.createCart(undefined, newSessionId);

        cookieStore.set("cartId", newSessionId, {
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
        });
      }
    }

    if (!cart) return { success: false, message: "خطا در ایجاد سبد خرید" };

    // ۲. چک کردن موجودی (با استفاده از سرویس)
    const availableStock = await cartService.checkStock(productId, variantId);

    // اگر موجودی صفر بود
    if (availableStock <= 0) {
      return { success: false, message: "این محصول ناموجود است." };
    }

    // ۳. مدیریت آیتم تکراری یا جدید
    const existingItem = cart.items.find(
      (item) =>
        item.productId === productId && item.variantId === (variantId || null)
    );

    if (existingItem) {
      if (existingItem.quantity < availableStock) {
        await db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + 1 },
        });
      } else {
        return { success: false, message: "موجودی این محصول کافی نیست." };
      }
    } else {
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId: productId,
          variantId: variantId || null,
          quantity: 1,
        },
      });
    }

    revalidatePath("/", "layout");
    return { success: true, message: "به سبد خرید اضافه شد." };
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return { success: false, message: "خطا در افزودن به سبد خرید." };
  }
}

// ۲. تغییر تعداد (بدون تغییر زیاد، فقط منطق دریافت سبد عوض شد)
export async function updateQuantityAction(
  productId: string,
  newQuantity: number,
  variantId?: string
) {
  try {
    const { userId, sessionCartId } = await getCartContext();
    const cart = await cartService.getCart(userId, sessionCartId);

    if (!cart) return { success: false, message: "سبد خرید یافت نشد." };

    const item = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
        variantId: variantId || null,
      },
      include: { variant: true, product: true },
    });

    if (!item) return { success: false, message: "آیتم یافت نشد." };

    const stock = item.variant ? item.variant.stock : item.product.stock;

    if (newQuantity <= 0) {
      await db.cartItem.delete({ where: { id: item.id } });
    } else if (newQuantity <= stock) {
      await db.cartItem.update({
        where: { id: item.id },
        data: { quantity: newQuantity },
      });
    } else {
      return { success: false, message: "موجودی کافی نیست." };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update Qty Error:", error);
    return { success: false, message: "خطا در ویرایش تعداد." };
  }
}

// ۳. حذف محصول
export async function removeFromCartAction(
  productId: string,
  variantId?: string
) {
  try {
    const { userId, sessionCartId } = await getCartContext();
    const cart = await cartService.getCart(userId, sessionCartId);

    if (!cart) return { success: false, message: "سبد خرید یافت نشد." };

    const item = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
        variantId: variantId || null,
      },
    });

    if (item) {
      await db.cartItem.delete({ where: { id: item.id } });
    }

    revalidatePath("/", "layout");
    return { success: true, message: "حذف شد." };
  } catch (error) {
    console.error("Remove Error:", error);
    return { success: false, message: "خطا در حذف محصول." };
  }
}
