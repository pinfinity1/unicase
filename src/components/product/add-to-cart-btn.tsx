"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { addToCartAction } from "@/actions/cart";

interface AddToCartButtonProps {
  productId: string;
  variantId?: string; // 👈 اضافه شدن برای پشتیبانی از رنگ/مدل
  stock: number;
  onSuccess?: () => void;
}

export function AddToCartButton({
  productId,
  variantId,
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
        // 👈 پاس دادن هر دو پارامتر به اکشن اصلاح شده
        const res = await addToCartAction(productId, variantId);

        if (res.success) {
          setButtonState("success");
          toast.success(res.message);
          if (onSuccess) setTimeout(onSuccess, 800);
        } else {
          setButtonState("error");
          toast.error(res.message);
        }
      } catch (error) {
        setButtonState("error");
        toast.error("خطای سیستمی");
      }
    });
  };

  return (
    <Button
      size="lg"
      onClick={handleAddToCart}
      disabled={isPending || buttonState === "success" || stock <= 0}
      className={cn(
        "w-full h-14 text-lg rounded-2xl gap-3 transition-all",
        buttonState === "success" ? "bg-green-600" : "bg-gray-900"
      )}
    >
      {isPending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : buttonState === "success" ? (
        <Check className="h-6 w-6" />
      ) : (
        <ShoppingCart className="h-5 w-5" />
      )}
      <span>
        {isPending
          ? "در حال پردازش..."
          : buttonState === "success"
          ? "به سبد اضافه شد"
          : "افزودن به سبد خرید"}
      </span>
    </Button>
  );
}
