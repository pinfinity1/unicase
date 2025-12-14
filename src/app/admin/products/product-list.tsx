import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { ProductActions } from "./product-actions";

// تابع کمکی برای فرمت قیمت به تومان
const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fa-IR").format(price);
};

export async function ProductList() {
  // ۱. دریافت محصولات خام از دیتابیس
  const rawProducts = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
    },
  });

  // ۲. دریافت دسته‌بندی‌ها
  const categories = await db.category.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  // 👈 ۳. (بخش جدید) تبدیل Decimal به Number برای رفع ارور
  const products = rawProducts.map((product) => ({
    ...product,
    price: product.price.toNumber(), // تبدیل مهم: دسی‌مال به عدد
    // اگر فیلد دسی‌مال دیگری مثل rating یا discountPrice دارید، اینجا تبدیل کنید
  }));

  // اگر محصولی نبود
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-gray-50/50 mt-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
          <ImageIcon className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">محصولی یافت نشد</h3>
        <p className="text-sm text-gray-500 mt-2">
          هنوز هیچ محصولی به فروشگاه اضافه نکرده‌اید.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden mt-6">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="w-20 text-right">تصویر</TableHead>
            <TableHead className="text-right font-bold">نام محصول</TableHead>
            <TableHead className="text-right">دسته‌بندی</TableHead>
            <TableHead className="text-right">قیمت (تومان)</TableHead>
            <TableHead className="text-center">موجودی</TableHead>
            <TableHead className="text-center">وضعیت</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="hover:bg-gray-50/50 transition-colors"
            >
              {/* ستون تصویر */}
              <TableCell>
                <div className="relative h-12 w-12 rounded-lg overflow-hidden border bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </TableCell>

              {/* نام محصول */}
              <TableCell className="font-bold text-gray-900">
                {product.name}
              </TableCell>

              {/* دسته‌بندی */}
              <TableCell className="text-gray-600">
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium">
                  {product.category.name}
                </span>
              </TableCell>

              {/* قیمت */}
              <TableCell className="font-mono font-medium text-gray-900">
                {formatPrice(product.price)}
              </TableCell>

              {/* موجودی */}
              <TableCell className="text-center">
                {product.stock > 0 ? (
                  <span className="font-mono">{product.stock}</span>
                ) : (
                  <span className="text-red-500 text-xs font-bold">
                    ناموجود
                  </span>
                )}
              </TableCell>

              {/* وضعیت فعال/غیرفعال */}
              <TableCell className="text-center">
                <div
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    product.isAvailable ? "bg-green-500" : "bg-gray-300"
                  }`}
                  title={product.isAvailable ? "فعال" : "غیرفعال"}
                />
              </TableCell>

              {/* ستون عملیات */}
              <TableCell>
                {/* حالا پروداکتی که اینجا پاس می‌دهیم، قیمتش عدد است و ارور نمی‌دهد */}
                <ProductActions product={product} categories={categories} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
