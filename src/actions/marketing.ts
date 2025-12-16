"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function generateLuckyDeals(discountPercent: number = 10) {
  // 👈 ورودی درصد اضافه شد (پیش‌فرض ۱۰)
  try {
    // ۱. پاک کردن تخفیف‌های قبلی
    await db.product.updateMany({
      where: { discountPrice: { not: null } },
      data: { discountPrice: null },
    });

    // ۲. گرفتن محصولات
    const products = await db.product.findMany({
      where: { isAvailable: true, isArchived: false },
      select: { id: true, price: true },
    });

    if (products.length < 4) {
      return { success: false, message: "تعداد محصولات کافی نیست" };
    }

    const shuffled = products.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    // ۳. اعمال تخفیف بر اساس درصد ورودی
    for (const product of selected) {
      const price = Number(product.price);
      // فرمول محاسبه تخفیف: قیمت * (۱ - درصد/۱۰۰)
      const multiplier = 1 - discountPercent / 100;
      const discountPrice = Math.round(price * multiplier);

      await db.product.update({
        where: { id: product.id },
        data: { discountPrice: discountPrice },
      });
    }

    revalidatePath("/");
    return {
      success: true,
      message: `تخفیف ${discountPercent} درصدی اعمال شد! 🎲`,
    };
  } catch (error) {
    console.error("Lucky Deal Error:", error);
    return { success: false, message: "خطا در سیستم" };
  }
}

export async function generateFeaturedProducts() {
  try {
    // ۱. ریست کردن محصولات ویژه قبلی (همه false شوند)
    await db.product.updateMany({
      where: { isFeatured: true },
      data: { isFeatured: false },
    });

    // ۲. گرفتن لیست محصولات موجود
    const products = await db.product.findMany({
      where: { isAvailable: true, isArchived: false },
      select: { id: true },
    });

    if (products.length < 4) {
      return { success: false, message: "تعداد محصولات کافی نیست" };
    }

    // ۳. انتخاب ۸ محصول تصادفی
    const shuffled = products.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 8); // ۸ تا انتخاب می‌کنیم

    // ۴. تبدیل منتخب‌ها به ویژه (isFeatured = true)
    // چون در Prisma روش updateMany با where: { id: { in: [...] } } راحت است:
    const selectedIds = selected.map((p) => p.id);

    await db.product.updateMany({
      where: { id: { in: selectedIds } },
      data: { isFeatured: true },
    });

    // ۵. به‌روزرسانی صفحه
    revalidatePath("/");

    return { success: true, message: "لیست محبوب‌ترین‌ها آپدیت شد! ⭐" };
  } catch (error) {
    console.error("Featured Error:", error);
    return { success: false, message: "خطا در آپدیت محبوب‌ترین‌ها" };
  }
}
