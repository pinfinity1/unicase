"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// اسکیمای اعتبارسنجی
const CategorySchema = z.object({
  name: z.string().min(2, { message: "نام دسته‌بندی باید حداقل ۲ حرف باشد." }),
  slug: z
    .string()
    .min(2, { message: "اسلاگ باید حداقل ۲ حرف باشد." })
    .regex(/^[a-z0-9-]+$/, {
      message:
        "اسلاگ فقط می‌تواند شامل حروف انگلیسی کوچک، اعداد و خط تیره باشد.",
    }),
});

export type CategoryFormState = {
  errors?: {
    name?: string[];
    slug?: string[];
    _form?: string[];
  };
  message?: string;
  success?: boolean;
};

// --- CREATE ---
export async function createCategory(
  prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const rawName = formData.get("name") as string;
  const rawSlug = (formData.get("slug") as string)
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  const validated = CategorySchema.safeParse({ name: rawName, slug: rawSlug });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "لطفاً خطاهای فرم را بررسی کنید.",
      success: false,
    };
  }

  try {
    await db.category.create({
      data: { name: validated.data.name, slug: validated.data.slug },
    });
    revalidatePath("/admin/categories");
    return { message: "دسته‌بندی ساخته شد.", success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        errors: { slug: ["این نامک (Slug) قبلاً استفاده شده است."] },
        success: false,
      };
    }
    return { message: "خطای دیتابیس رخ داد.", success: false };
  }
}

// --- UPDATE ---
export async function updateCategory(
  id: string,
  prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const rawName = formData.get("name") as string;
  const rawSlug = (formData.get("slug") as string)
    ?.toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  const validated = CategorySchema.safeParse({ name: rawName, slug: rawSlug });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "لطفاً خطاهای فرم را بررسی کنید.",
      success: false,
    };
  }

  try {
    await db.category.update({
      where: { id },
      data: { name: validated.data.name, slug: validated.data.slug },
    });
    revalidatePath("/admin/categories");
    return { message: "دسته‌بندی ویرایش شد.", success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return {
        errors: { slug: ["این نامک قبلاً استفاده شده است."] },
        success: false,
      };
    }
    return { message: "خطای دیتابیس رخ داد.", success: false };
  }
}

// --- DELETE ---
export async function deleteCategory(id: string) {
  try {
    // ۱. بررسی وجود محصولات
    const category = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) return { success: false, message: "دسته‌بندی یافت نشد." };

    if (category._count.products > 0) {
      return {
        success: false,
        message: `این دسته‌بندی دارای ${category._count.products} محصول است و نمی‌تواند حذف شود.`,
      };
    }

    // ۲. حذف
    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true, message: "دسته‌بندی حذف شد." };
  } catch (error) {
    return { success: false, message: "خطای سیستمی رخ داده است." };
  }
}
