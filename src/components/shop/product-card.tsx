"use client";

import Image from "next/image";
import Link from "next/link";
// import { Product } from "@prisma/client"; // 👈 این را پاک کنید یا کامنت کنید چون تایپمان دستی شد
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

// تایپ جدید که با دیتای تبدیل شده در page.tsx هماهنگ است
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number; // 👈 قیمت اینجا عدد است، نه Decimal
    image: string | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  // ✅ اصلاح شد: حذف .toNumber() چون ورودی خودش عدد است
  const formattedPrice = new Intl.NumberFormat("fa-IR").format(product.price);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    toast.success(`${product.name} به سبد خرید اضافه شد`);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">
            تصویر ندارد
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-1">
          {product.name}
        </h3>

        <p className="mb-4 text-sm text-gray-500 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">قیمت:</span>
            <span className="text-lg font-bold text-primary font-mono">
              {formattedPrice}{" "}
              <span className="text-xs font-normal text-gray-500">تومان</span>
            </span>
          </div>

          <Button
            size="icon"
            className="rounded-full shadow-md hover:scale-110 transition-transform"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
