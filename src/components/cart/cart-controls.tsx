"use client";

import { useTransition } from "react";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { updateQuantityAction, removeFromCartAction } from "@/actions/cart";

interface CartControlsProps {
  itemId: string;
  quantity: number;
  maxStock: number;
  className?: string;
  // 👇 پراپ جدید: تابعی که وقتی عدد عوض شد صدا زده میشه
  onUpdate?: (newQuantity: number) => void;
}

export function CartControls({
  itemId,
  quantity,
  maxStock,
  className,
  onUpdate,
}: CartControlsProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (newQty: number) => {
    if (isPending) return;

    // 🚀 آپدیت سریع UI (قبل از سرور)
    if (onUpdate) onUpdate(newQty);

    startTransition(async () => {
      const res = await updateQuantityAction(itemId, newQty);
      if (!res.success) {
        // اگر سرور ارور داد، باید برگردیم به عدد قبلی (Rollback)
        // اینجا فعلا فقط ارور میدیم، ولی میشه state رو هم برگردوند
        toast.error(res.message);
        // اگر تابع onUpdateRevert داشتیم اینجا صداش میزدیم
      }
    });
  };

  const handleRemove = () => {
    if (isPending) return;

    // 🚀 آپدیت سریع UI: تعداد صفر میشه
    if (onUpdate) onUpdate(0);

    startTransition(async () => {
      const res = await removeFromCartAction(itemId);
      if (res.success) toast.success("حذف شد");
      else toast.error(res.message);
    });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between rounded-full p-1.5 h-14 w-40 bg-gray-100 border border-gray-200",
        className
      )}
    >
      {/* دکمه + */}
      <button
        onClick={() => handleUpdate(quantity + 1)}
        disabled={isPending || quantity >= maxStock}
        className={cn(
          "h-11 w-11 flex items-center justify-center rounded-full shadow-sm transition-all duration-200",
          "bg-white text-gray-700 hover:text-primary border border-gray-100",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
        )}
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* نمایشگر عدد */}
      <div className="flex-1 flex items-center justify-center font-bold text-gray-900 text-lg w-8 font-mono">
        {isPending ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <span
            key={quantity}
            className="animate-in fade-in zoom-in duration-300"
          >
            {quantity.toLocaleString("fa")}
          </span>
        )}
      </div>

      {/* دکمه - یا حذف */}
      <button
        onClick={() =>
          quantity === 1 ? handleRemove() : handleUpdate(quantity - 1)
        }
        disabled={isPending}
        className={cn(
          "h-11 w-11 flex items-center justify-center rounded-full shadow-sm transition-all duration-200 border border-gray-100",
          quantity === 1
            ? "bg-white text-red-500 hover:bg-red-50 hover:border-red-100"
            : "bg-white text-gray-700 hover:text-primary",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50"
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
