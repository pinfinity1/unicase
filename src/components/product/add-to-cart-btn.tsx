"use client";

import { useState, useTransition, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addToCartAction } from "@/actions/cart";

interface AddToCartButtonProps {
  productId: string;
  stock: number;
  onSuccess?: () => void; // 👈 پراپ جدید
}

export function AddToCartButton({
  productId,
  stock,
  onSuccess,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [buttonState, setButtonState] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const handleAddToCart = () => {
    if (stock <= 0) return;

    startTransition(async () => {
      try {
        const res = await addToCartAction(productId);

        if (res.success) {
          setButtonState("success");
          toast.success(res.message);

          // 👇 خبر دادن به والد برای تغییر وضعیت به کنترلر
          if (onSuccess) {
            // کمی تاخیر برای دیدن انیمیشن تیک سبز
            setTimeout(() => {
              onSuccess();
            }, 1000);
          }
        } else {
          setButtonState("error");
          toast.error(res.message);
        }
      } catch (error) {
        setButtonState("error");
        toast.error("خطای ارتباط با سرور");
      }
    });
  };

  // ... (بقیه کدهای JSX بدون تغییر)
  return (
    <Button
      size="lg"
      onClick={handleAddToCart}
      disabled={isPending || buttonState === "success"}
      className={cn(
        "w-full h-14 text-lg rounded-2xl gap-3 transition-all duration-300 transform active:scale-[0.98]",
        buttonState === "success"
          ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200 shadow-lg"
          : buttonState === "error"
          ? "bg-red-600 hover:bg-red-700 text-white"
          : "bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200"
      )}
    >
      {isPending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="font-medium">در حال پردازش...</span>
        </>
      ) : buttonState === "success" ? (
        <>
          <Check className="h-6 w-6 animate-in zoom-in duration-300" />
          <span className="font-bold animate-in fade-in slide-in-from-bottom-2">
            به سبد اضافه شد
          </span>
        </>
      ) : buttonState === "error" ? (
        <>
          <X className="h-6 w-6" />
          <span>خطا در ثبت</span>
        </>
      ) : (
        <>
          <ShoppingCart className="h-5 w-5 opacity-90" />
          <span className="font-medium">افزودن به سبد خرید</span>
        </>
      )}
    </Button>
  );
}
