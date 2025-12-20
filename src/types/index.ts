// src/types/index.ts
import { Brand, Category, Prisma, ProductVariant } from "@prisma/client";

// ۱. تعریف واریانت برای سمت کلاینت (اعداد number و تاریخ‌ها string)
export type ProductVariantClient = Omit<
  ProductVariant,
  "priceDiff" | "createdAt" | "updatedAt"
> & {
  priceDiff: number;
  createdAt: string;
  updatedAt: string;
};

// ۲. تعریف ساختار دیتای خام که از پریزما می‌گیریم
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: true;
    brand: true;
  };
}>;

// ۳. تعریف محصول نهایی برای سمت کلاینت (کامپوننت‌های "use client")
export type ProductClient = Omit<
  ProductWithRelations,
  "price" | "discountPrice" | "variants" | "createdAt" | "updatedAt"
> & {
  price: number;
  discountPrice: number | null;
  variants: ProductVariantClient[]; // استفاده از تایپ اصلاح شده در بالا
  category: Category;
  brand: Brand | null;
  createdAt: string;
  updatedAt: string;
};

export type FormState = {
  success?: boolean;
  message: string;
  errors?: {
    [key: string]: string[] | undefined;
  };
};

// سایر تایپ‌ها (بدون تغییر)...
export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    user: true;
    items: true;
  };
}>;
