"use server";

import { getOrCreateCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ۱. افزودن به سبد خرید
export async function addToCartAction(productId: string, variantId?: string) {
  // 👈 اضافه کردن ورودی دوم
  try {
    const cart = await getOrCreateCart();

    // پیدا کردن محصول و واریانت برای چک کردن موجودی دقیق
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return { success: false, message: "محصول یافت نشد." };
    }

    // تعیین موجودی مجاز (اگر واریانت داشت، موجودی همان رنگ، وگرنه موجودی کل)
    let availableStock = product.stock;
    if (variantId) {
      const selectedVariant = product.variants.find((v) => v.id === variantId);
      if (selectedVariant) availableStock = selectedVariant.stock;
    }

    // چک کنیم آیا این ترکیب محصول و واریانت قبلاً در سبد بوده؟
    const existingItem = cart.items.find(
      (item) =>
        item.productId === productId && item.variantId === (variantId || null)
    );

    if (existingItem) {
      // بررسی موجودی قبل از اضافه کردن
      if (existingItem.quantity < availableStock) {
        await db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + 1 },
        });
      } else {
        return { success: false, message: "موجودی این مدل کافی نیست." };
      }
    } else {
      // ایجاد آیتم جدید با ثبت واریانت
      if (availableStock > 0) {
        await db.cartItem.create({
          data: {
            cartId: cart.id,
            productId: productId,
            variantId: variantId || null, // 👈 ثبت در ستون جدید دیتابیس
            quantity: 1,
          },
        });
      } else {
        return { success: false, message: "این مدل ناموجود است." };
      }
    }

    revalidatePath("/", "layout");
    return { success: true, message: "به سبد خرید اضافه شد." };
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return { success: false, message: "خطا در افزودن به سبد خرید." };
  }
}

export async function updateQuantityAction(
  productId: string,
  newQuantity: number,
  variantId?: string // 👈 اضافه شدن پارامتر سوم برای رفع خطا
) {
  try {
    const cart = await getOrCreateCart();

    // پیدا کردن دقیق ردیف مورد نظر بر اساس محصول و واریانت
    const item = await db.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: productId,
        variantId: variantId || null,
      },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!item) return { success: false, message: "آیتم در سبد خرید یافت نشد." };

    // بررسی موجودی انبار بر اساس واریانت یا محصول اصلی
    const availableStock = item.variant
      ? item.variant.stock
      : item.product.stock;

    if (newQuantity <= 0) {
      // اگر تعداد صفر شد، حذف کن
      await db.cartItem.delete({ where: { id: item.id } });
    } else if (newQuantity <= availableStock) {
      // آپدیت تعداد در صورت داشتن موجودی
      await db.cartItem.update({
        where: { id: item.id },
        data: { quantity: newQuantity },
      });
    } else {
      return { success: false, message: "موجودی انبار کافی نیست." };
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Update Qty Error:", error);
    return { success: false, message: "خطا در ویرایش تعداد." };
  }
}

/**
 * حذف کامل یک آیتم خاص (محصول + واریانت) از سبد خرید
 */
export async function removeFromCartAction(
  productId: string,
  variantId?: string
) {
  try {
    const cart = await getOrCreateCart();

    // پیدا کردن ردیف دقیق برای حذف
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
    return { success: true, message: "محصول از سبد حذف شد." };
  } catch (error) {
    console.error("Remove Error:", error);
    return { success: false, message: "خطا در حذف محصول." };
  }
}
