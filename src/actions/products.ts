// مسیر فایل: src/actions/products.ts
"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadImage, deleteImage } from "@/lib/s3";
import { requireAdmin } from "@/lib/auth-guard";

const ProductSchema = z.object({
  name: z.string().min(2, "نام محصول باید حداقل ۲ حرف باشد."),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
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

export type ProductFormState = {
  errors?: {
    name?: string[];
    price?: string[];
    stock?: string[];
    categoryId?: string[];
    description?: string[];
  };
  message?: string;
  success?: boolean;
};

// ۱. ایجاد محصول
export async function createProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
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

  const { name, description, price, stock, categoryId, isAvailable, image } =
    validated.data;

  let imageUrl: string | undefined;

  try {
    if (image && image.size > 0) {
      imageUrl = await uploadImage(image, "products");
    }

    await db.product.create({
      data: {
        name,
        slug:
          name.toLowerCase().replace(/\s+/g, "-") +
          "-" +
          Date.now().toString().slice(-4),
        description,
        price,
        stock,
        categoryId,
        isAvailable,
        // ✅ اصلاح شد: هم عکس اصلی پر می‌شود و هم گالری
        image: imageUrl || null, // عکس اصلی (برای کارت محصول)
        images: imageUrl ? [imageUrl] : [], // گالری (برای اسلایدر صفحه جزئیات)
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/"); // صفحه اصلی هم باید رفرش شود تا محصول جدید دیده شود
    return { success: true, message: "محصول با موفقیت ایجاد شد." };
  } catch (e) {
    console.error(e);
    return { success: false, message: "خطا در برقراری ارتباط با دیتابیس." };
  }
}

// ۲. ویرایش محصول
export async function updateProduct(
  id: string,
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
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

    // پیش‌فرض: عکس اصلی قبلی
    let imageUrl =
      product.image ||
      (product.images.length > 0 ? product.images[0] : undefined);

    // اگر عکس جدید آپلود شده باشد
    if (image && image.size > 0 && image.name !== "undefined") {
      imageUrl = await uploadImage(image, "products");

      // حذف عکس قبلی از فضای ابری (اختیاری ولی تمیزتر)
      if (product.images.length > 0) {
        // اینجا می‌توانیم عکس قبلی را پاک کنیم اما شاید بخواهید در گالری بماند
        // فعلاً کد حذف شما را نگه می‌دارم که فقط ۱ عکس نگه می‌دارد:
        await deleteImage(product.images[0]);
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
        isAvailable,
        // ✅ اصلاح شد: آپدیت همزمان عکس اصلی و گالری
        image: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, message: "محصول ویرایش شد." };
  } catch (error) {
    console.error(error);
    return { success: false, message: "خطا در ویرایش محصول." };
  }
}

// ۳. حذف محصول (بدون تغییر)
export async function deleteProduct(productId: string) {
  try {
    await requireAdmin();
  } catch (error) {
    return { success: false, message: "دسترسی غیرمجاز" };
  }

  try {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return { success: false, message: "محصول یافت نشد." };

    // حذف تمام عکس‌های گالری
    for (const img of product.images) {
      await deleteImage(img);
    }
    // اگر عکس اصلی جداگانه ذخیره شده و در images نیست، اینجا باید آن را هم پاک کنید
    // اما چون در منطق بالا عکس اصلی حتماً داخل images هم هست، کد فعلی کافیست.

    await db.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    revalidatePath("/");
    return { success: true, message: "محصول حذف شد." };
  } catch (error) {
    return { success: false, message: "خطا در حذف محصول." };
  }
}
