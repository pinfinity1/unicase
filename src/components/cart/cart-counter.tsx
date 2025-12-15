import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCart } from "@/lib/cart";

export async function CartCounter() {
  // ۱. دریافت سبد از دیتابیس (بدون هوک، مستقیم!)
  const cart = await getCart();

  // ۲. محاسبه تعداد کل
  const itemsCount =
    cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <Button variant="ghost" asChild className="relative mr-2">
      <Link href="/cart">
        <ShoppingCart className="h-5 w-5" />
        {itemsCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm animate-in zoom-in">
            {itemsCount}
          </span>
        ) : null}
        <span className="sr-only">سبد خرید</span>
      </Link>
    </Button>
  );
}
