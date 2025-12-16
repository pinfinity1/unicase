// مسیر فایل: src/actions/products.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadImage, deleteImage } from "@/lib/s3";
import { requireAdmin } from "@/lib/auth-guard";
import { slugify } from "@/lib/utils"; // 👈 استفاده از ابزار استاندارد
import { FormState } from "@/types"; // 👈 استفاده از تایپ مشترک

const ProductSchema = z.object({
  name: z.string().min(2, "نام محصول باید حداقل ۲ حرف باشد."),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد."),
  stock: z.coerce.number().int().min(0, "موجودی نمی‌تواند منفی باشد."),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است."),
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

// ۱. ایجاد محصول
export async function createProduct(
  prevState: FormState, // 👈 تایپ اصلاح شد
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
    isAvailable: formData.get("isAvailable") === "on", // چک باکس
    image: formData.get("image") as File,
  });

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      success: false,
      message: "لطفاً ورودی‌ها را بررسی کنید.",
    };
  }

  const { name, description, price, stock, categoryId, isAvailable, image } =
    validated.data;

  let imageUrl: string | undefined;

  try {
    if (image && image.size > 0) {
      imageUrl = await uploadImage(image, "products");
    }

    // 👈 تولید اسلاگ یکتا با تابع استاندارد + عدد تصادفی برای جلوگیری از تکرار
    const uniqueSlug = `${slugify(name)}-${Date.now().toString().slice(-4)}`;

    await db.product.create({
      data: {
        name,
        slug: uniqueSlug,
        description,
        price, // اینجا عدد پاس می‌دهیم و پریزما خودش به Decimal تبدیل می‌کند (برای Create اوکی است)
        stock,
        categoryId,
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

// ۲. ویرایش محصول
export async function updateProduct(
  id: string,
  prevState: FormState, // 👈 تایپ اصلاح شد
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

  const { name, description, price, stock, categoryId, isAvailable, image } =
    validated.data;

  try {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return { success: false, message: "محصول پیدا نشد." };

    let imageUrl =
      product.image ||
      (product.images.length > 0 ? product.images[0] : undefined);

    // اگر عکس جدید آپلود شده بود
    if (image && image.size > 0 && image.name !== "undefined") {
      imageUrl = await uploadImage(image, "products");

      // حذف عکس قبلی اگر وجود داشت
      if (product.images.length > 0) {
        // خطا را نادیده می‌گیریم تا پروسه آپدیت متوقف نشود
        await deleteImage(product.images[0]).catch(console.error);
      }
    }

    await db.product.update({
      where: { id },
      data: {
        name,
        // نکته: معمولاً اسلاگ را در ویرایش تغییر نمی‌دهند تا لینک‌های سئو خراب نشود.
        // اگر می‌خواهید تغییر کند، خط زیر را آنکامنت کنید:
        // slug: slugify(name),
        description,
        price,
        stock,
        categoryId,
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

// ۳. حذف محصول
export async function deleteProduct(productId: string) {
  try {
    await requireAdmin();
  } catch (error) {
    return { success: false, message: "دسترسی غیرمجاز" };
  }

  try {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return { success: false, message: "محصول یافت نشد." };

    // تلاش برای حذف عکس‌ها از S3
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
