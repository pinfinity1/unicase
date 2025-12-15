"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CartControlsProps {
  productId: string;
  maxStock: number;
  className?: string;
}

export function CartControls({
  productId,
  maxStock,
  className,
}: CartControlsProps) {
  const { items, updateQuantity, removeItem } = useCartStore();
  const item = items.find((i) => i.id === productId);

  const [localQty, setLocalQty] = useState(item?.quantity || 0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (item) setLocalQty(item.quantity);
  }, [item?.quantity]);

  useEffect(() => {
    if (!item || localQty === item.quantity) {
      setIsSyncing(false);
      return;
    }
    setIsSyncing(true);
    const timer = setTimeout(() => {
      updateQuantity(productId, localQty);
      setIsSyncing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [localQty, productId, updateQuantity, item]);

  if (!item) return null;

  const handleIncrement = () => {
    if (localQty < maxStock) setLocalQty((prev) => prev + 1);
    else toast.error("موجودی کافی نیست");
  };

  const handleDecrementOrRemove = () => {
    if (localQty > 1) {
      setLocalQty((prev) => prev - 1);
    } else {
      removeItem(productId);
      toast.info("حذف شد");
    }
  };

  return (
    // ✨ کانتینر اصلی:
    // bg-gray-100: زمینه طوسی روشن که روی سفید دیده می‌شود
    // border border-gray-200: یک خط نازک برای وضوح بیشتر
    <div
      className={cn(
        "flex items-center justify-between rounded-full p-1.5 h-14 w-40 bg-gray-100 border border-gray-200",
        className
      )}
    >
      {/* دکمه + */}
      <button
        onClick={handleIncrement}
        disabled={localQty >= maxStock}
        // دکمه سفید روی زمینه طوسی (کنتراست عالی)
        // حذف scale و جایگزینی با hover:bg-gray-50
        className="h-11 w-11 flex items-center justify-center cursor-pointer bg-white rounded-full shadow-sm text-gray-700 border border-gray-100 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-5 w-5" />
      </button>

      {/* نمایشگر عدد */}
      <div className="flex-1 flex items-center justify-center font-bold text-gray-900 text-lg w-8 font-mono">
        {isSyncing ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : (
          // حذف انیمیشن zoom-in برای ثبات بیشتر
          <span>{localQty.toLocaleString("fa")}</span>
        )}
      </div>

      {/* دکمه - یا حذف */}
      <button
        onClick={handleDecrementOrRemove}
        className={cn(
          "h-11 w-11 flex items-center justify-center cursor-pointer bg-white rounded-full shadow-sm border border-gray-100 transition-colors",
          localQty === 1
            ? "text-red-500 hover:bg-red-50 hover:border-red-100"
            : "text-gray-700 hover:text-primary"
        )}
      >
        {localQty === 1 ? (
          <Trash2 className="h-5 w-5" />
        ) : (
          <Minus className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}
