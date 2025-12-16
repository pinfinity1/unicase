import { ProductClient, ProductWithCategory } from "@/types";
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

export function formatPrice(price: number | string) {
  return new Intl.NumberFormat("fa-IR").format(Number(price));
}

export function serializeProduct(product: ProductWithCategory): ProductClient {
  return {
    ...product,
    price: product.price.toNumber(),
    discountPrice: product.discountPrice
      ? product.discountPrice.toNumber()
      : null,
  };
}
