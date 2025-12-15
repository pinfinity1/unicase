"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guard";
import { slugify } from "@/lib/utils"; // استفاده از تابع مشترک

const CategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
});

export async function createCategory(data: z.infer<typeof CategorySchema>) {
  await requireAdmin();

  const validated = CategorySchema.safeParse(data);
  if (!validated.success)
    return { success: false, message: "اطلاعات نامعتبر است" };

  // ۱. تمیزکاری نهایی اسلاگ قبل از ثبت
  const cleanSlug = slugify(validated.data.slug);

  try {
    // ۲. بررسی تکراری بودن اسلاگ
    const existing = await db.category.findUnique({
      where: { slug: cleanSlug },
    });

    if (existing) {
      return {
        success: false,
        message: "این نامک (Slug) قبلاً استفاده شده است. لطفاً تغییر دهید.",
      };
    }

    await db.category.create({
      data: {
        name: validated.data.name,
        slug: cleanSlug,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "دسته‌بندی ساخته شد." };
  } catch (error) {
    return { success: false, message: "خطای دیتابیس" };
  }
}

export async function updateCategory(
  id: string,
  data: z.infer<typeof CategorySchema>
) {
  await requireAdmin();

  const validated = CategorySchema.safeParse(data);
  if (!validated.success)
    return { success: false, message: "اطلاعات نامعتبر است" };

  const cleanSlug = slugify(validated.data.slug);

  try {
    // بررسی تکراری بودن (به جز خودش)
    const existing = await db.category.findFirst({
      where: {
        slug: cleanSlug,
        NOT: { id: id }, // یعنی اگر اسلاگ تکراری بود ولی مال خود همین آیتم بود، اشکال نداره
      },
    });

    if (existing) {
      return { success: false, message: "این نامک تکراری است." };
    }

    await db.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        slug: cleanSlug,
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "دسته‌بندی ویرایش شد." };
  } catch (error) {
    return { success: false, message: "خطای دیتابیس" };
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  try {
    // ۱. بررسی اینکه آیا دسته‌بندی وجود دارد؟
    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return { success: false, message: "دسته‌بندی یافت نشد." };
    }

    // ۲. جلوگیری از حذف دسته‌بندی‌های دارای محصول
    if (category._count.products > 0) {
      return {
        success: false,
        message: `این دسته‌بندی شامل ${category._count.products} محصول است و نمی‌توانید آن را حذف کنید. ابتدا محصولات را منتقل یا حذف کنید.`,
      };
    }

    // ۳. حذف نهایی
    await db.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "دسته‌بندی با موفقیت حذف شد." };
  } catch (error) {
    console.error("Delete Category Error:", error);
    return { success: false, message: "خطای سیستمی در حذف دسته‌بندی." };
  }
}
