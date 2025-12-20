// src/components/admin/products/product-list.tsx

import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductClient } from "@/types";
import Image from "next/image";
import { Prisma, ProductVariant } from "@prisma/client";
import { ProductActions } from "./product-actions";

// ۱. تعریف تایپ دقیق برای دیتای خام ورودی از Prisma
type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    brand: true;
    variants: true;
  };
}>;

export async function ProductList() {
  // دریافت موازی داده‌ها برای پرفورمنس بالاتر
  const [rawProducts, categories, brands] = await Promise.all([
    db.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        brand: true,
        variants: true,
      },
    }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.brand.findMany({ orderBy: { name: "asc" } }),
  ]);

  // ۲. تبدیل دیتا به فرمت کلاینت با تایپ‌بندی صریح
  // ما از ProductClient استفاده می‌کنیم تا مطمئن شویم داده‌ها برای کامپوننت‌های کلاینت قابل فهم هستند
  const products: ProductClient[] = rawProducts.map((p) => ({
    ...p,
    price: p.price.toNumber(),
    discountPrice: p.discountPrice ? p.discountPrice.toNumber() : null,

    // تبدیل تک‌تک واریانت‌ها
    variants: p.variants.map((v) => ({
      ...v,
      priceDiff: v.priceDiff ? v.priceDiff.toNumber() : 0,
      createdAt: v.createdAt.toISOString(),
      updatedAt: v.updatedAt.toISOString(),
    })),

    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-white/50 backdrop-blur rounded-3xl border border-white/20">
        <p className="text-gray-500">هنوز محصولی ثبت نشده است.</p>
      </div>
    );
  }

  return (
    <div className="glass-prism rounded-3xl overflow-hidden border border-white/20 shadow-xl bg-white/40 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-right" dir="rtl">
          <thead className="bg-white/60 text-gray-700 font-bold border-b border-gray-200/50">
            <tr>
              <th className="p-4 text-right">تصویر</th>
              <th className="p-4 text-right">نام محصول</th>
              <th className="p-4 text-right">دسته‌بندی / برند</th>
              <th className="p-4 text-right">قیمت</th>
              <th className="p-4 text-right">موجودی (تنوع)</th>
              <th className="p-4 text-right">وضعیت</th>
              <th className="p-4 text-left">عملیات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100/50">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-white/40 transition">
                <td className="p-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white shadow-sm">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-400">
                        بدون تصویر
                      </div>
                    )}
                  </div>
                </td>

                <td className="p-4 font-medium text-gray-800">
                  {product.name}
                </td>

                <td className="p-4 text-sm text-gray-600">
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold">
                      {product.category.name}
                    </span>
                    {product.brand && (
                      <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                        {product.brand.name}
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-4 text-sm font-mono">
                  {formatPrice(product.price)}
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {product.variants && product.variants.length > 0 ? (
                      product.variants.slice(0, 3).map((v, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-1 rounded border bg-white/80 border-gray-200 flex items-center gap-1"
                          title={`موجودی: ${v.stock}`}
                        >
                          <span
                            className="w-2 h-2 rounded-full border border-gray-300"
                            style={{ backgroundColor: v.colorCode || "#ddd" }}
                          />
                          {v.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-red-500">بدون تنوع</span>
                    )}
                    {product.variants && product.variants.length > 3 && (
                      <span className="text-[10px] px-1 py-1 text-gray-400">
                        +{product.variants.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    مجموع موجودی: {product.stock}
                  </div>
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-medium ${
                      product.isAvailable
                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                        : "bg-gray-100 text-gray-500 border border-gray-200"
                    }`}
                  >
                    {product.isAvailable ? "فعال" : "ناموجود"}
                  </span>
                </td>

                <td className="p-4 text-left">
                  <ProductActions
                    product={product}
                    categories={categories}
                    brands={brands}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
