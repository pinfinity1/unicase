"use client";

import { useCartStore } from "@/store/cart-store";
import { CartControls } from "@/components/cart/cart-controls";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const { items, addItem } = useCartStore();
  const [isInCart, setIsInCart] = useState(false);

  useEffect(() => {
    const exists = items.some((item) => item.id === product.id);
    setIsInCart(exists);
  }, [items, product.id]);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("موجودی تمام شده است");
      return;
    }
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      maxStock: product.stock,
    });
    toast.success("به سبد خرید اضافه شد");
  };

  // اگر محصول در سبد بود
  if (isInCart) {
    return (
      <div className="w-full flex flex-col items-center gap-3">
        {/* استفاده از کامپوننت جدید */}
        <CartControls
          productId={product.id}
          maxStock={product.stock}
          className="w-full max-w-[200px]" // عرض ثابت و جمع‌وجور
        />
        <span className="text-[11px] text-gray-400 font-medium">
          موجود در سبد خرید
        </span>
      </div>
    );
  }

  // دکمه اصلی افزودن (مینیمال و مدرن)
  return (
    <Button
      size="lg"
      onClick={handleAddToCart}
      disabled={product.stock === 0}
      className={cn(
        "w-full h-14 text-lg rounded-2xl gap-3 transition-colors", // حذف active:scale
        "bg-gray-900 text-white hover:bg-black shadow-none" // کاملا تخت و مشکی (مینیمال)
      )}
    >
      <ShoppingCart className="h-5 w-5 opacity-90" />
      <span className="font-medium">
        {product.stock > 0 ? "افزودن به سبد خرید" : "خبرم کن"}
      </span>
    </Button>
  );
}
