"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadImage, deleteImage } from "@/lib/s3";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const ProductSchema = z.object({
  name: z.string().min(2, "نام محصول باید حداقل ۲ حرف باشد."),
  description: z.string().optional(),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است."),
  isAvailable: z.coerce.boolean(),
  image: z.any().optional(), // در ویرایش شاید عکس نفرستند
});

export type ProductFormState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

// ۱. ایجاد محصول
export async function createProduct(
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  // ... (کد قبلی شما برای create) ...
  // برای خلاصه شدن اینجا ننوشتم چون قبلاً دارید، اما اگر خواستید بگویید کامل بگذارم
  // منطق همان است: validate -> upload -> db create
  // 👇 فقط برای اینکه کد کامل باشد، بخش create را خلاصه می‌نویسم:

  const validated = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isAvailable: formData.get("isAvailable") === "on",
    image: formData.get("image") as File,
  });

  if (!validated.success)
    return { errors: validated.error.flatten().fieldErrors, success: false };

  const { name, description, price, stock, categoryId, isAvailable, image } =
    validated.data;
  let imageUrl: string | undefined;

  try {
    if (image && image.size > 0)
      imageUrl = await uploadImage(image, "products");

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
        images: imageUrl ? [imageUrl] : [],
      },
    });
    revalidatePath("/admin/products");
    return { success: true, message: "محصول ایجاد شد." };
  } catch (e) {
    return { success: false, message: "خطا در ساخت محصول" };
  }
}

// ۲. ویرایش محصول (جدید)
export async function updateProduct(
  id: string,
  prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const validated = ProductSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    categoryId: formData.get("categoryId"),
    isAvailable: formData.get("isAvailable") === "on",
    image: formData.get("image") as File,
  });

  if (!validated.success)
    return { errors: validated.error.flatten().fieldErrors, success: false };

  const { name, description, price, stock, categoryId, isAvailable, image } =
    validated.data;

  try {
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return { success: false, message: "محصول پیدا نشد" };

    let imageUrl = product.images[0]; // عکس پیش‌فرض همان قبلی است

    // اگر عکس جدید آپلود شده باشد
    if (image && image.size > 0 && image.name !== "undefined") {
      // الف) آپلود عکس جدید
      imageUrl = await uploadImage(image, "products");
      // ب) حذف عکس قدیمی از MinIO (برای تمیز ماندن سرور)
      if (product.images.length > 0) {
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
        images: [imageUrl], // بروزرسانی آرایه عکس
      },
    });

    revalidatePath("/admin/products");
    return { success: true, message: "محصول ویرایش شد." };
  } catch (error) {
    return { success: false, message: "خطا در ویرایش محصول" };
  }
}

// ۳. حذف محصول (جدید)
export async function deleteProduct(productId: string) {
  try {
    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return { success: false, message: "محصول نیست" };

    // حذف عکس‌ها از MinIO
    for (const img of product.images) {
      await deleteImage(img);
    }

    await db.product.delete({ where: { id: productId } });
    revalidatePath("/admin/products");
    return { success: true, message: "حذف شد." };
  } catch (error) {
    return { success: false, message: "خطا در حذف." };
  }
}
