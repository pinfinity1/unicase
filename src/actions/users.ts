"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";

export async function updateUserRole(
  userId: string,
  newRole: "ADMIN" | "USER"
) {
  try {
    await requireAdmin(); // امنیت: فقط ادمین می‌تواند نقش‌ها را عوض کند

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
