import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCart } from "@/lib/cart";
import { formatPrice } from "@/lib/utils";

export async function CartCounter() {
  const cart = await getCart();
  const itemsCount =
    cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <Link href="/cart" className="relative group mr-2" aria-label="سبد خرید">
      {/* تغییرات:
         1. bg-white/40: پس‌زمینه همیشه فعال است (دیگر Ghost نیست)
         2. border-white/50: یک خط دور ظریف برای تفکیک از هدر
         3. shadow-sm: سایه ریز برای برجستگی
      */}
      <div
        className="
        flex h-10 w-10 items-center justify-center rounded-full 
        bg-white/40 hover:bg-white/60
        border border-white/50
        shadow-sm hover:shadow-md
        backdrop-blur-md
        transition-all duration-300 active:scale-95
      "
      >
        <ShoppingBag
          className="h-5 w-5 text-gray-900 transition-transform group-hover:scale-110"
          strokeWidth={2}
        />
      </div>

      {/* بج تعداد (Badge) */}
      {itemsCount > 0 && (
        <span
          className="
          absolute -top-1 -right-1
          flex h-5 w-5 items-center justify-center rounded-full 
          bg-black text-white 
          text-[10px] font-bold 
          ring-2 ring-white
          shadow-sm
          animate-in zoom-in duration-300
        "
        >
          {formatPrice(itemsCount)}
        </span>
      )}
    </Link>
  );
}
