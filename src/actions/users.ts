"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { FormState } from "@/types";

// ۱. تعریف تایپ برای وضعیت فرم (که در کامپوننت ایمپورت کردید)
export type ProfileFormState = FormState | null;

// ۲. تابع ویرایش پروفایل توسط خود کاربر
export async function updateProfileInfo(
  prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  try {
    const session = await auth();

    // امنیت: بررسی لاگین بودن کاربر
    if (!session?.user?.id) {
      return { success: false, message: "ابتدا وارد حساب خود شوید" };
    }

    const name = formData.get("name") as string;

    // اعتبار سنجی ساده نام
    if (!name || name.length < 3) {
      return { success: false, message: "نام باید حداقل ۳ حرف باشد" };
    }

    // به‌روزرسانی فیلد name در مدل User
    await db.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    revalidatePath("/profile");
    return { success: true, message: "اطلاعات با موفقیت بروزرسانی شد" };
  } catch (error) {
    return { success: false, message: "خطا در بروزرسانی پروفایل" };
  }
}

// ۳. تابع قبلی شما برای مدیریت ادمین
export async function updateUserRole(
  userId: string,
  newRole: "ADMIN" | "USER"
) {
  try {
    await requireAdmin();

    await db.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "نقش کاربر با موفقیت تغییر کرد" };
  } catch (error: any) {
    return { success: false, message: "خطا در بروزرسانی نقش" };
  }
}
