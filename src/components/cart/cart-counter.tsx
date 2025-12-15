"use client"; // 👈 این خط حیاتی است

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import useStore from "@/hooks/use-store";
import { cn } from "@/lib/utils";

export function CartCounter() {
  // استفاده از هوک برای جلوگیری از ارور Hydration
  const itemsCount = useStore(useCartStore, (state) => state.getTotalItems());

  return (
    <Button variant="ghost" asChild className="relative mr-2">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {/* نمایش بج (Badge) تعداد فقط زمانی که آیتمی وجود دارد */}
        {itemsCount && itemsCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
            {itemsCount}
          </span>
        ) : null}
        <span className="sr-only">سبد خرید</span>
      </Link>
    </Button>
  );
}
