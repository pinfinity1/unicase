"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

// 👇 اصلاح شده: تبدیل Decimal به number
export async function getShippingMethods() {
  const methods = await db.shippingMethod.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  // تبدیل مپ برای رفع خطای Decimal
  return methods.map((method) => ({
    ...method,
    price: method.price.toNumber(), // 👈 نکته کلیدی اینجاست
  }));
}

export async function createShippingMethod(data: {
  name: string;
  price: number;
  description?: string;
}) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return { success: false, message: "دسترسی غیرمجاز" };

  try {
    await db.shippingMethod.create({
      data: {
        name: data.name,
        price: data.price,
        description: data.description,
      },
    });
    revalidatePath("/admin/shipping");
    revalidatePath("/checkout");
    return { success: true, message: "روش ارسال افزوده شد" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "خطا در ساخت روش ارسال" };
  }
}

export async function deleteShippingMethod(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN")
    return { success: false, message: "دسترسی غیرمجاز" };

  try {
    await db.shippingMethod.delete({ where: { id } });
    revalidatePath("/admin/shipping");
    revalidatePath("/checkout");
    return { success: true, message: "روش ارسال حذف شد" };
  } catch (error) {
    return { success: false, message: "خطا در حذف" };
  }
}
