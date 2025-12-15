"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    image: string | null;
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("fa-IR").format(product.price);

  // فقط متد افزودن را می‌گیریم
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();

    if (product.stock <= 0) {
      toast.error("موجودی تمام شده است");
      return;
    }

    // همیشه ۱ عدد اضافه میکند
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      maxStock: product.stock,
    });

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

        {/* قیمت و دکمه */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary font-mono">
              {formattedPrice}{" "}
              <span className="text-xs text-gray-500">تومان</span>
            </span>
          </div>

          <Button
            size="icon"
            // جلوگیری از کلیک روی لینک والد وقتی دکمه زده میشه
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="rounded-xl shadow-md shadow-primary/20 hover:scale-105 transition-all"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Link>
  );
}
