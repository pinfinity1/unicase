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
import { ImageIcon, Archive, CheckCircle2, XCircle } from "lucide-react";
import { ProductActions } from "./product-actions";
import { serializeProduct } from "@/lib/utils";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fa-IR").format(price);
};

export async function ProductList() {
  const rawProducts = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, brand: true },
  });
  const categories = await db.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
  });

  // تبدیل دیتای خام
  const products = rawProducts.map((product) => serializeProduct(product));

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-4xl border border-white/60 bg-white/40 backdrop-blur-xl p-12 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm text-gray-300 mb-4">
          <ImageIcon className="h-10 w-10" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">محصولی یافت نشد</h3>
        <p className="text-sm text-gray-500 mt-2">
          هنوز محصولی اضافه نکرده‌اید.
        </p>
      </div>
    );
  }

  return (
    // ✨ کانتینر شیشه‌ای اصلی
    <div className="rounded-4xl border border-white/60 bg-white/60 backdrop-blur-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="border-b border-gray-200/50 hover:bg-transparent">
            <TableHead className="w-24 text-right pr-6">تصویر</TableHead>
            <TableHead className="text-right font-bold text-gray-600">
              نام محصول
            </TableHead>
            <TableHead className="text-right text-gray-600">
              دسته‌بندی
            </TableHead>
            <TableHead className="text-right text-gray-600">قیمت</TableHead>
            <TableHead className="text-center text-gray-600">موجودی</TableHead>
            <TableHead className="text-center text-gray-600">وضعیت</TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow
              key={product.id}
              className="border-b border-gray-100/50 hover:bg-white/60 transition-colors group"
            >
              {/* تصویر با استایل iOS Icon */}
              <TableCell className="pr-6">
                <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white shadow-sm bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
              </TableCell>

              <TableCell className="font-bold text-gray-800 text-base">
                {product.name}
              </TableCell>

              <TableCell>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-white border border-gray-100 text-xs font-medium text-gray-600 shadow-sm">
                  {product.category.name}
                </span>
              </TableCell>

              <TableCell className="font-mono font-bold text-gray-900 text-base">
                {formatPrice(product.price)}{" "}
                <span className="text-[10px] text-gray-400 font-sans font-normal">
                  تومان
                </span>
              </TableCell>

              <TableCell className="text-center">
                {product.stock > 0 ? (
                  <span className="font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    {product.stock.toLocaleString("fa")}
                  </span>
                ) : (
                  <span className="text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full">
                    تمام شد
                  </span>
                )}
              </TableCell>

              <TableCell className="text-center">
                {product.isAvailable ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                    <CheckCircle2 className="h-3 w-3" />
                    فعال
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold border border-gray-200">
                    <Archive className="h-3 w-3" />
                    بایگانی
                  </div>
                )}
              </TableCell>

              <TableCell>
                <ProductActions
                  product={product}
                  categories={categories}
                  brands={brands}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
