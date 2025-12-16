"use client";

import Link from "next/link";
import Image from "next/image";
import { Flame } from "lucide-react";
import { ProductClient } from "@/types";
import { formatPrice } from "@/lib/utils";

interface SearchSuggestionsProps {
  suggestions: ProductClient[];
  onSelect: () => void;
}

export function SearchSuggestions({
  suggestions,
  onSelect,
}: SearchSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="animate-in fade-in slide-in-from-top-1 duration-300 pb-2">
      <div className="flex items-center gap-2 px-3 py-2 mb-1">
        <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
        <span className="text-xs font-bold text-gray-500">پیشنهادهای داغ</span>
      </div>

      <div className="flex flex-col gap-1">
        {suggestions.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            onClick={onSelect}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors group"
          >
            {/* تصویر ریسپانسیو */}
            <div className="relative h-14 w-14 sm:h-12 sm:w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100">
              {product.images?.[0] && (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
              <h4 className="text-sm font-bold text-gray-800 truncate leading-tight group-hover:text-blue-600">
                {product.name}
              </h4>
              <span className="text-[11px] text-gray-400 truncate">
                {product.category?.name}
              </span>
            </div>

            <div className="flex flex-col items-end justify-center">
              {product.discountPrice && (
                <span className="text-[10px] text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded-md mb-1">
                  %
                  {formatPrice(
                    (
                      100 -
                      (product.discountPrice / product.price) * 100
                    ).toFixed(0)
                  )}
                </span>
              )}
              <span className="text-sm font-bold font-mono text-gray-900">
                {formatPrice(product.discountPrice || product.price)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
