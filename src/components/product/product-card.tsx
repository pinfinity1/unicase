import Link from "next/link";
import Image from "next/image";
import { cn, formatPrice } from "@/lib/utils";
import { ProductClient } from "@/types";
import { Zap } from "lucide-react";

interface ProductCardProps {
  product: ProductClient;
  isLucky?: boolean;
}

export function ProductCard({ product, isLucky = false }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  const productImage =
    product.images && product.images.length > 0 ? product.images[0] : null;

  const finalPrice = product.discountPrice
    ? product.discountPrice
    : product.price;

  const discountPercent = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100
      )
    : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group flex flex-col gap-4 transition-all duration-300 hover:-translate-y-1 relative",
        isOutOfStock && "opacity-75 grayscale-[0.5]"
      )}
    >
      {/* ۱. قاب تصویر (اصلاح شده برای عکس‌های رنگی) 
          - p-0: پدینگ حذف شد تا عکس به لبه‌ها بچسبد
          - bg-gray-100: رنگ پس‌زمینه ملایم برای زمانی که عکس لود نشده
      */}
      <div
        className={cn(
          "relative aspect-square w-full overflow-hidden rounded-[32px] bg-gray-100 flex items-center justify-center transition-all group-hover:shadow-lg",
          isLucky &&
            "border-2 border-blue-200 shadow-blue-100 ring-2 ring-blue-50"
        )}
      >
        {productImage ? (
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            // تغییرات مهم اینجاست 👇
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-102"
            // object-cover: کل کادر را پر می‌کند
            // scale-105: زوم بسیار نرم (اپل استایل)
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm font-medium">
            تصویر ندارد
          </div>
        )}

        {/* لایه شیشه‌ای روی عکس در حالت هاور (اختیاری - برای زیبایی بیشتر) */}
        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/2" />

        {/* بج ناموجود */}
        {isOutOfStock && (
          <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 shadow-sm border border-gray-100">
            ناموجود
          </div>
        )}

        {/* بج‌های گوشه سمت راست */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end">
          {/* بج تخفیف */}
          {!isOutOfStock && product.discountPrice && (
            <div className="bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm ring-2 ring-white">
              ٪{formatPrice(discountPercent)}
            </div>
          )}

          {/* بج شانس */}
          {!isOutOfStock && isLucky && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm ring-2 ring-white animate-pulse">
              <Zap className="h-3.5 w-3.5 fill-current" />
            </div>
          )}
        </div>
      </div>

      {/* ۲. بخش اطلاعات */}
      <div className="flex flex-col items-start px-1 space-y-1.5">
        <h3 className="font-bold text-base text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors min-h-[2.5rem]">
          {product.name}
        </h3>

        <div className="flex items-center flex-wrap gap-2">
          {isOutOfStock ? (
            <span className="text-sm font-medium text-gray-400">
              فعلاً موجود نیست
            </span>
          ) : (
            <>
              {product.discountPrice && (
                <span className="text-xs text-gray-400 line-through decoration-gray-300">
                  {formatPrice(product.price)}
                </span>
              )}

              <div className="flex items-baseline gap-1">
                <span
                  className={cn(
                    "text-lg font-bold text-gray-900 font-mono tracking-tight",
                    isLucky && "text-blue-600"
                  )}
                >
                  {formatPrice(finalPrice)}
                </span>
                <span className="text-[10px] font-medium text-gray-500">
                  تومان
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
