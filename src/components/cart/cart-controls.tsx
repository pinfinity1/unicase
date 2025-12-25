"use client";

import { useTransition } from "react";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateQuantityAction, removeFromCartAction } from "@/actions/cart";

interface CartControlsProps {
  itemId: string; // در اینجا همان productId است
  variantId?: string; // 👈 اضافه شدن شناسه‌ی واریانت
  quantity: number;
  maxStock: number;
  className?: string;
  onUpdate?: (newQuantity: number) => void;
}

export function CartControls({
  itemId,
  variantId,
  quantity,
  maxStock,
  className,
  onUpdate,
}: CartControlsProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newQty: number) => {
    if (isPending) return;

    if (onUpdate) onUpdate(newQty);

    startTransition(async () => {
      // 👈 ارسال هر دو شناسه به سرور
      const res = await updateQuantityAction(itemId, newQty, variantId);
      if (!res.success) {
        toast.error(res.message);
        if (onUpdate) onUpdate(quantity); // Rollback
      }
    });
  };

  const handleRemove = () => {
    if (isPending) return;

    if (onUpdate) onUpdate(0);

    startTransition(async () => {
      // 👈 ارسال هر دو شناسه برای حذف دقیق
      const res = await removeFromCartAction(itemId, variantId);
      if (res.success) toast.success("حذف شد");
      else {
        toast.error(res.message);
        if (onUpdate) onUpdate(quantity); // Rollback
      }
    });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-full p-1.5 h-14 w-40 bg-gray-100 border border-gray-200",
        className
      )}
    >
      <button
        onClick={() => handleUpdate(quantity + 1)}
        disabled={isPending || quantity >= maxStock}
        className="h-11 w-11 flex items-center justify-center rounded-full bg-white shadow-sm disabled:opacity-50"
      >
        <Plus className="h-5 w-5" />
      </button>

      <div className="flex-1 flex items-center justify-center font-bold text-lg font-mono">
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          quantity.toLocaleString("fa")
        )}
      </div>

      <button
        onClick={() =>
          quantity === 1 ? handleRemove() : handleUpdate(quantity - 1)
        }
        disabled={isPending}
        className={cn(
          "h-11 w-11 flex items-center justify-center rounded-full bg-white shadow-sm",
          quantity === 1 && "text-red-500"
        )}
      >
        {quantity === 1 ? (
          <Trash2 className="h-5 w-5" />
        ) : (
          <Minus className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
