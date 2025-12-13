"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ورودی اول prevState اضافه شد
export async function createCategory(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) {
    return { message: "لطفاً نام و اسلاگ را وارد کنید" };
  }

  try {
    await db.category.create({
      data: {
        name,
        slug: slug.toLowerCase().replace(/\s+/g, "-"),
      },
    });

    // موفقیت: فرم ریست شود یا پیام موفقیت (فعلا چیزی برنمی‌گردانیم که فرم خالی شود)
    revalidatePath("/admin/categories");
    return { message: "دسته‌بندی با موفقیت ساخته شد!", success: true };
  } catch (error) {
    return { message: "این نامک (Slug) قبلاً استفاده شده است." };
  }
}

export async function deleteCategory(id: string) {
  try {
    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
  } catch (error) {
    console.log(error);
  }
}
