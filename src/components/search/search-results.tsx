"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { ProductClient } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SearchResultsProps {
  results: ProductClient[];
  query: string;
  onSelect: () => void;
  onViewAll: () => void;
}

export function SearchResults({
  results,
  query,
  onSelect,
  onViewAll,
}: SearchResultsProps) {
  return (
    <div className="flex flex-col gap-1 pb-2">
      <p className="px-3 py-2 text-xs font-medium text-gray-400">
        نتایج یافت شده
      </p>
      {results.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          onClick={onSelect}
          className="flex items-center gap-3 p-2 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-colors group"
        >
          {/* تصویر */}
          <div className="relative h-12 w-12 sm:h-10 sm:w-10 flex-shrink-0 overflow-hidden rounded-lg bg-white border border-gray-100">
            {product.images?.[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* نام فارسی */}
            <p className="text-sm font-medium text-gray-700 truncate group-hover:text-blue-700 leading-tight">
              {product.name}
            </p>

            {/* 👇 نام انگلیسی (اگر وجود داشت نشان بده) */}
            {/* اما چون در تایپ ProductClient هنوز اضافه‌اش نکردیم، شاید تایپ‌اسکریپت گیر بدهد */}
            {/* فعلا اگر تایپش را آپدیت نکردید، از product['nameEn'] استفاده کنید یا کلا بیخیال نمایش شوید */}
            <p className="text-[10px] text-gray-400 truncate mt-0.5 font-sans">
              {(product as any).nameEn || product.category?.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900 font-mono">
              {formatPrice(product.discountPrice || product.price)}
            </span>
            <ChevronLeft className="h-4 w-4 text-gray-300 rtl:rotate-180" />
          </div>
        </Link>
      ))}

      <button
        onClick={onViewAll}
        className="mt-3 w-full py-3.5 sm:py-3 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 rounded-xl transition-colors"
      >
        مشاهده تمام نتایج برای "{query}"
      </button>
    </div>
  );
}
