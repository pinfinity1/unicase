"use server";

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { revalidatePath } from "next/cache";
import { FormState } from "@/types";

export async function updateSettings(
  prevState: FormState, // اضافه شدن این پارامتر الزامی است
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin(); // بررسی سطح دسترسی [cite: 1553]

    const data = {
      storeName: formData.get("storeName") as string,
      contactPhone: formData.get("contactPhone") as string,
      contactEmail: formData.get("contactEmail") as string,
      address: formData.get("address") as string,
      description: formData.get("description") as string,
    };

    await db.siteSettings.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    revalidatePath("/", "layout");
    revalidatePath("/admin/settings");

    return { success: true, message: "تنظیمات با موفقیت به‌روزرسانی شد" };
  } catch (error: any) {
    return { success: false, message: error.message || "خطا در بروزرسانی" };
  }
}
