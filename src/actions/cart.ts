"use server";

import { getOrCreateCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ۱. افزودن به سبد خرید
export async function addToCartAction(productId: string) {
  try {
    const cart = await getOrCreateCart();

    // پیدا کردن محصول برای چک کردن موجودی
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return { success: false, message: "محصول یافت نشد." };
    }

    // چک کنیم آیا این محصول قبلاً در سبد بوده؟
    const existingItem = cart.items.find(
      (item) => item.productId === productId
    );

    if (existingItem) {
      // اگر بود، یکی به تعدادش اضافه کن (به شرط موجودی)
      if (existingItem.quantity < product.stock) {
        await db.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + 1 },
        });
      } else {
        return { success: false, message: "موجودی محصول کافی نیست." };
      }
    } else {
      // اگر نبود، آیتم جدید بساز
      if (product.stock > 0) {
        await db.cartItem.create({
          data: {
            cartId: cart.id,
            productId: productId,
            quantity: 1,
          },
        });
      } else {
        return { success: false, message: "محصول ناموجود است." };
      }
    }

    // رفرش کردن صفحه برای آپدیت شدن هدر و سبد
    revalidatePath("/", "layout");
    return { success: true, message: "به سبد خرید اضافه شد." };
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return { success: false, message: "خطا در افزودن به سبد خرید." };
  }
}

// ...

export async function updateQuantityAction(
  itemIdOrProductId: string,
  newQuantity: number
) {
  try {
    const cart = await getOrCreateCart();

    // ۱. اول سعی کن به عنوان CartItemId پیدا کنی
    let item = await db.cartItem.findUnique({
      where: { id: itemIdOrProductId },
      include: { product: true },
    });

    // ۲. اگر پیدا نشد، شاید ProductId فرستاده شده؟ پس توی سبد جاری دنبالش بگرد
    if (!item) {
      item = await db.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId: itemIdOrProductId,
        },
        include: { product: true },
      });
    }

    if (!item) return { success: false, message: "آیتم در سبد خرید یافت نشد." };

    // لاجیک آپدیت (تکراری)
    if (newQuantity <= 0) {
      await db.cartItem.delete({ where: { id: item.id } });
    } else if (newQuantity <= item.product.stock) {
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
    console.error(error);
    return { success: false, message: "خطا در ویرایش تعداد." };
  }
}

// برای removeFromCartAction هم همین لاجیک "جستجوی هوشمند" را نیاز داریم
export async function removeFromCartAction(itemIdOrProductId: string) {
  try {
    const cart = await getOrCreateCart();

    // اول مستقیم، اگر نبود از طریق productId
    let item = await db.cartItem.findUnique({
      where: { id: itemIdOrProductId },
    });

    if (!item) {
      item = await db.cartItem.findFirst({
        where: { cartId: cart.id, productId: itemIdOrProductId },
      });
    }

    if (item) {
      await db.cartItem.delete({ where: { id: item.id } });
    }

    revalidatePath("/", "layout");
    return { success: true, message: "محصول از سبد حذف شد." };
  } catch (error) {
    return { success: false, message: "خطا در حذف محصول." };
  }
}
