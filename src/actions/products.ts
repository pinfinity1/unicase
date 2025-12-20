"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { uploadImage, deleteImage } from "@/lib/s3";
import { requireAdmin } from "@/lib/auth-guard";
import { slugify } from "@/lib/utils";
import { FormState } from "@/types";

// ۱. تعریف اینترفیس برای واریانت جهت جلوگیری از any
interface Variant {
  name: string;
  colorCode: string;
  stock: number;
  priceDiff: number;
  imageUrl: string | null;
}

const ProductSchema = z.object({
  name: z.string().min(2, "نام محصول الزامی است"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  categoryId: z.string().min(1, "انتخاب دسته‌بندی الزامی است"),
  brandId: z.string().optional().nullable(),
  isAvailable: z.coerce.boolean(),
});

// ۲. اصلاح تابع کمکی با تایپ خروجی مشخص
function processVariants(
  variantsJson: string,
  finalImages: string[]
): Variant[] {
  try {
    const parsed = JSON.parse(variantsJson);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((v: any) => ({
      name: String(v.name || ""),
      colorCode: String(v.colorCode || "#000000"),
      stock: Number(v.stock || 0),
      priceDiff: Number(v.priceDiff || 0),
      imageUrl:
        v.imageIndex !== null && v.imageIndex !== undefined
          ? finalImages[v.imageIndex]
          : null,
    }));
  } catch {
    return [];
  }
}

// =========================================================
// ایجاد محصول جدید
// =========================================================
export async function createProduct(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin();

    // نکته: Object.fromEntries فقط اولین مقدار هر کلید را می‌گیرد
    const rawData = Object.fromEntries(formData.entries());
    const validated = ProductSchema.safeParse(rawData);

    if (!validated.success)
      return {
        success: false,
        message: "خطا در ورودی‌ها",
        errors: validated.error.flatten().fieldErrors,
      };

    const imageFiles = formData.getAll("images") as File[];
    const uploadedUrls = await Promise.all(
      imageFiles
        .filter((f) => f.size > 0)
        .map((file) => uploadImage(file, "products"))
    );

    const variants = processVariants(
      formData.get("variants") as string,
      uploadedUrls
    );

    // ۳. اصلاح خطا با تعیین تایپ acc و curr
    const totalStock = variants.reduce(
      (acc: number, curr: Variant) => acc + curr.stock,
      0
    );

    await db.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          ...validated.data,
          brandId:
            validated.data.brandId === "null" ? null : validated.data.brandId,
          slug: `${slugify(validated.data.name)}-${Math.random()
            .toString(36)
            .slice(-4)}`,
          stock: totalStock,
          images: uploadedUrls,
          image: uploadedUrls[0] || null,
          variants: {
            create: variants,
          },
        },
      });
    });

    revalidatePath("/admin/products");
    return { success: true, message: "محصول با موفقیت ایجاد شد" };
  } catch (error) {
    console.error("Create Product Error:", error);
    return { success: false, message: "خطای سرور در ایجاد محصول" };
  }
}

// =========================================================
// ویرایش محصول
// =========================================================
export async function updateProduct(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  try {
    await requireAdmin();

    const rawData = Object.fromEntries(formData.entries());
    const validated = ProductSchema.safeParse(rawData);

    if (!validated.success)
      return { success: false, message: "خطا در اعتبار سنجی" };

    const existingImages = JSON.parse(
      (formData.get("existingImages") as string) || "[]"
    ) as string[];

    const newImageFiles = formData.getAll("images") as File[];
    const newUrls = await Promise.all(
      newImageFiles
        .filter((f) => f.size > 0)
        .map((file) => uploadImage(file, "products"))
    );
    const finalImages = [...existingImages, ...newUrls];

    const variants = processVariants(
      formData.get("variants") as string,
      finalImages
    );

    // ۴. اصلاح خطا در بخش ویرایش
    const totalStock = variants.reduce(
      (acc: number, curr: Variant) => acc + curr.stock,
      0
    );

    await db.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          ...validated.data,
          brandId:
            validated.data.brandId === "null" ? null : validated.data.brandId,
          stock: totalStock,
          images: finalImages,
          image: finalImages[0] || null,
        },
      });

      // حذف و ایجاد مجدد واریانت‌ها برای حفظ سادگی و دقت
      await tx.productVariant.deleteMany({ where: { productId: id } });

      if (variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v) => ({
            name: v.name,
            colorCode: v.colorCode,
            stock: v.stock,
            priceDiff: v.priceDiff,
            imageUrl: v.imageUrl,
            productId: id,
          })),
        });
      }
    });

    revalidatePath("/admin/products");
    return { success: true, message: "بروزرسانی با موفقیت انجام شد" };
  } catch (error) {
    console.error("Update Product Error:", error);
    return { success: false, message: "خطا در بروزرسانی محصول" };
  }
}

// =========================================================
// حذف محصول
// =========================================================
export async function deleteProduct(id: string) {
  try {
    await requireAdmin();
    const product = await db.product.findUnique({ where: { id } });

    if (product?.images && product.images.length > 0) {
      // حذف موازی برای پرفورمنس بالاتر
      await Promise.all(
        product.images.map((url) => deleteImage(url).catch(() => {}))
      );
    }

    await db.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true, message: "محصول و تصاویر آن حذف شدند" };
  } catch (error) {
    console.error("Delete Product Error:", error);
    return { success: false, message: "خطا در حذف محصول" };
  }
}
