"use server";

import { db } from "@/lib/db";
import { addressSchema, AddressFormData } from "@/lib/validations/address";
import { auth } from "@/auth"; // یا هر جایی که auth را اکسپورت کردید
import { revalidatePath } from "next/cache";

export async function createAddress(data: AddressFormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "لطفا ابتدا وارد حساب کاربری شوید" };
    }

    // 1. اعتبارسنجی داده‌ها
    const validatedFields = addressSchema.safeParse(data);
    if (!validatedFields.success) {
      return { success: false, message: "اطلاعات وارد شده صحیح نیست" };
    }

    // 2. ذخیره در دیتابیس
    await db.address.create({
      data: {
        userId: session.user.id,
        ...validatedFields.data,
      },
    });

    // 3. آپدیت کردن کش صفحه‌ها
    revalidatePath("/profile/addresses");
    revalidatePath("/checkout");

    return { success: true, message: "آدرس با موفقیت ثبت شد" };
  } catch (error) {
    console.error("Address Create Error:", error);
    return { success: false, message: "خطایی در ثبت آدرس رخ داد" };
  }
}

export async function deleteAddress(addressId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "عدم دسترسی" };

    await db.address.delete({
      where: {
        id: addressId,
        userId: session.user.id, // امنیت: کاربر فقط آدرس خودش را پاک کند
      },
    });

    revalidatePath("/profile/addresses");
    return { success: true, message: "آدرس حذف شد" };
  } catch (error) {
    return { success: false, message: "خطا در حذف آدرس" };
  }
}
