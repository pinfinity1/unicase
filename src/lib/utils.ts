import { ProductClient } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // جایگزینی فاصله با خط تیره
    .replace(/[^\w\u0600-\u06FF\-]+/g, "") // حذف کاراکترهای غیرمجاز (حفظ حروف فارسی و انگلیسی و اعداد)
    .replace(/\-\-+/g, "-") // حذف خط تیره‌های تکراری (--- -> -)
    .replace(/^-+/, "") // حذف خط تیره از اول
    .replace(/-+$/, ""); // حذف خط تیره از آخر
}

export function formatPrice(value: any): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  return Number(value.toString());
}

export function toPlainObject<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function serializeProduct(product: any): ProductClient {
  return {
    ...product,
    price: product.price.toString(),
    discountPrice: product.discountPrice
      ? product.discountPrice.toString()
      : null,
    createdAt: product.createdAt.toString(),
    updatedAt: product.updatedAt.toString(),
    category: product.category,
    brand: product.brand || null,
  };
}
