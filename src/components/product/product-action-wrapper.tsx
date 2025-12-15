"use client";

import { useState, useEffect } from "react";
import { AddToCartButton } from "./add-to-cart-btn";
import { CartControls } from "@/components/cart/cart-controls";

interface ProductActionWrapperProps {
  productId: string;
  stock: number;
  initialQuantity: number;
}

export function ProductActionWrapper({
  productId,
  stock,
  initialQuantity,
}: ProductActionWrapperProps) {
  const [quantity, setQuantity] = useState(initialQuantity);

  // این useEffect مهمه: اگر کاربر صفحه رو رفرش نکرد ولی نویگیت کرد، استیت رو با پراپ سینک میکنه
  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const onAddSuccess = () => {
    setQuantity(1);
  };

  // 👇 تابع جدید: وقتی توی کنترلر دکمه زده شد، این اجرا میشه
  const handleQuantityUpdate = (newQty: number) => {
    setQuantity(newQty);
  };

  if (stock <= 0) {
    return (
      <div className="w-full h-14 rounded-2xl bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center font-medium cursor-not-allowed">
        ناموجود
      </div>
    );
  }

  // اگر محصول در سبد باشد
  if (quantity > 0) {
    return (
      <div className="animate-in fade-in zoom-in duration-300">
        <CartControls
          itemId={productId}
          quantity={quantity}
          maxStock={stock}
          // 👇 اتصال سیم ارتباطی بین فرزند و والد
          onUpdate={handleQuantityUpdate}
          className="w-full h-14 bg-white border-2 border-gray-100 shadow-sm"
        />
        <p className="text-center text-xs text-gray-400 mt-2">
          موجود در سبد شما
        </p>
      </div>
    );
  }

  return (
    <AddToCartButton
      productId={productId}
      stock={stock}
      onSuccess={onAddSuccess}
    />
  );
}
