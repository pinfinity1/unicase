"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/lib/auth-guard";
import { FormState } from "@/types";

// 1. Validation Schema
const BrandSchema = z.object({
  name: z.string().min(2, "نام برند باید حداقل ۲ حرف باشد"),
  slug: z
    .string()
    .min(2, "نامک الزامی است")
    .regex(/^[a-z0-9\u0600-\u06FF\-]+$/, "فرمت نامک صحیح نیست"),
  // فعلا لوگو را اختیاری می‌گیریم تا بعدا آپلودر را اضافه کنیم
  logo: z.string().optional().nullable(),
});

// 2. Create Brand
export async function createBrand(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin();

    const validated = BrandSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
    });

    if (!validated.success) {
      return {
        success: false,
        message: "اطلاعات نامعتبر است",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { name, slug } = validated.data;

    // چک کردن تکراری نبودن اسلاگ
    const existing = await db.brand.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, message: "این نامک قبلا ثبت شده است" };
    }

    await db.brand.create({
      data: {
        name,
        slug,
        // فعلا لوگو نال است
      },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/admin/products"); // چون در فرم محصول هم لیست برندها را داریم
    return { success: true, message: "برند با موفقیت ساخته شد" };
  } catch (error) {
    console.error("Brand Create Error:", error);
    return { success: false, message: "خطای سیستمی در ساخت برند" };
  }
}

// 3. Delete Brand
export async function deleteBrand(id: string) {
  try {
    await requireAdmin();
    await db.brand.delete({ where: { id } });
    revalidatePath("/admin/brands");
    return { success: true, message: "برند حذف شد" };
  } catch (error) {
    return {
      success: false,
      message: "خطا در حذف برند (شاید محصولی به آن متصل است)",
    };
  }
}

export async function updateBrand(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin();

    const validated = BrandSchema.safeParse({
      name: formData.get("name"),
      slug: formData.get("slug"),
    });

    if (!validated.success) {
      return {
        success: false,
        message: "اطلاعات نامعتبر است",
        errors: validated.error.flatten().fieldErrors,
      };
    }

    const { name, slug } = validated.data;

    // چک کردن تکراری نبودن اسلاگ (به جز خود این برند)
    const existing = await db.brand.findFirst({
      where: {
        slug,
        NOT: { id }, // خودش را نادیده بگیر
      },
    });

    if (existing) {
      return {
        success: false,
        message: "این نامک قبلا برای برند دیگری ثبت شده است",
      };
    }

    await db.brand.update({
      where: { id },
      data: { name, slug },
    });

    revalidatePath("/admin/brands");
    revalidatePath("/admin/products");
    return { success: true, message: "برند با موفقیت ویرایش شد" };
  } catch (error) {
    console.error("Brand Update Error:", error);
    return { success: false, message: "خطای سیستمی در ویرایش برند" };
  }
}
