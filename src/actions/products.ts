"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadImage, deleteImage } from "@/lib/s3";
import { requireAdmin } from "@/lib/auth-guard";
import { slugify } from "@/lib/utils";
import { FormState } from "@/types";

// ۱. آپدیت اسکیما برای دریافت brandId
const ProductSchema = z.object({
  name: z.string().min(2, "نام محصول باید حداقل ۲ حرف باشد."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد."),
  stock: z.coerce.number().int().min(0, "موجودی نمی‌تواند منفی باشد."),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است."),
  brandId: z.string().optional(), // 👈 اضافه شد (اختیاری)
  isAvailable: z.coerce.boolean(),
  image: z
    .instanceof(File, { message: "فایل نامعتبر است." })
    .optional()
    .refine(
      (file) => !file || file.size === 0 || file.type.startsWith("image/"),
      {
        message: "فقط فایل‌های تصویری مجاز هستند.",
      }
    )
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: "حجم تصویر نباید بیشتر از ۵ مگابایت باشد.",
    }),
});

// --- تابع کمکی برای مدیریت brandId ---
// اگر مقدار "null" یا خالی بود، null برگرداند وگرنه خود ID را
function parseBrandId(value: unknown): string | null {
  if (typeof value === "string" && (value === "null" || value.trim() === "")) {
    return null;
  }
  return value as string;
}

// ۲. ایجاد محصول
export async function createProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch (error) {
    return { success: false, message: "دسترسی غیرمجاز: شما ادمین نیستید." };
  }

  const validated = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId"), // 👈 دریافت از فرم
    isAvailable: formData.get("isAvailable") === "on",
    image: formData.get("image") as File,
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      success: false,
      message: "لطفاً ورودی‌ها را بررسی کنید.",
    };
  }

  const {
    name,
    description,
    price,
    stock,
    categoryId,
    brandId,
    isAvailable,
    image,
  } = validated.data;

  let imageUrl: string | undefined;

  try {
    if (image && image.size > 0) {
      imageUrl = await uploadImage(image, "products");
    }

    const uniqueSlug = `${slugify(name)}-${Date.now().toString().slice(-4)}`;

    await db.product.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        price,
        stock,
        categoryId,
        // 👈 ذخیره برند (اگر null باشد ذخیره نمی‌شود یا null می‌شود)
        brandId: parseBrandId(brandId),
        isAvailable,
        image: imageUrl || null,
        images: imageUrl ? [imageUrl] : [],
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, message: "محصول با موفقیت ایجاد شد." };
  } catch (e) {
    console.error("Create Product Error:", e);
    return { success: false, message: "خطا در برقراری ارتباط با دیتابیس." };
  }
}

// ۳. ویرایش محصول
export async function updateProduct(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin();
  } catch (error) {
    return { success: false, message: "دسترسی غیرمجاز" };
  }

  const validated = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    brandId: formData.get("brandId"), // 👈 دریافت از فرم
    isAvailable: formData.get("isAvailable") === "on",
    image: formData.get("image") as File,
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      success: false,
      message: "خطا در اعتبارسنجی فرم.",
    };
  }

  const {
    name,
    description,
    price,
    stock,
    categoryId,
    brandId,
    isAvailable,
    image,
  } = validated.data;

  try {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return { success: false, message: "محصول پیدا نشد." };

    let imageUrl =
      product.image ||
      (product.images.length > 0 ? product.images[0] : undefined);

    if (image && image.size > 0 && image.name !== "undefined") {
      imageUrl = await uploadImage(image, "products");
      if (product.images.length > 0) {
        await deleteImage(product.images[0]).catch(console.error);
      }
    }

    await db.product.update({
      where: { id },
      data: {
        name,
        description,
        price,
        stock,
        categoryId,
        brandId: parseBrandId(brandId),
        isAvailable,
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, message: "محصول ویرایش شد." };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { success: false, message: "خطا در ویرایش محصول." };
  }
}

// ۴. حذف محصول (بدون تغییر)
export async function deleteProduct(productId: string) {
  try {
    await requireAdmin();
  } catch (error) {
    return { success: false, message: "دسترسی غیرمجاز" };
  }

  try {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return { success: false, message: "محصول یافت نشد." };

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        await deleteImage(img).catch((err) =>
          console.error("Failed to delete image from S3:", err)
        );
      }
    }

    await db.product.delete({ where: { id: productId } });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, message: "محصول حذف شد." };
  } catch (error) {
    console.error("Delete Product Error:", error);
    return { success: false, message: "خطا در حذف محصول." };
  }
}
