"use client";

import { useState, useEffect } from "react";
import { AddToCartButton } from "./add-to-cart-btn";
import { CartControls } from "@/components/cart/cart-controls";
import { cn } from "@/lib/utils";

// ۱. تعریف تایپ واریانت برای کلاینت
interface ProductVariantClient {
  id: string;
  name: string;
  colorCode: string | null;
  stock: number;
  priceDiff: number | null;
}

interface ProductActionWrapperProps {
  productId: string;
  basePrice: number;
  discountPrice: number | null;
  stock: number;
  variants: ProductVariantClient[];
  initialQuantity: number;
}

export function ProductActionWrapper({
  productId,
  basePrice,
  discountPrice,
  stock,
  variants,
  initialQuantity,
}: ProductActionWrapperProps) {
  // ۲. مدیریت استیت واریانت انتخابی (به صورت پیش‌فرض اولین واریانت)
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length > 0 ? variants[0].id : null
  );

  const [quantity, setQuantity] = useState(initialQuantity);

  // پیدا کردن دیتای واریانت فعلی برای محاسبه قیمت و موجودی
  const currentVariant = variants.find((v) => v.id === selectedVariantId);

  // ۳. محاسبه قیمت نهایی (قیمت پایه + اختلاف قیمت واریانت)
  const currentPrice =
    (discountPrice || basePrice) + Number(currentVariant?.priceDiff || 0);
  const currentStock = currentVariant ? currentVariant.stock : stock;

  useEffect(() => {
    setQuantity(initialQuantity);
  }, [initialQuantity]);

  const handleQuantityUpdate = (newQty: number) => {
    setQuantity(newQty);
  };

  if (currentStock <= 0) {
    return (
      <div className="w-full h-14 rounded-2xl bg-gray-100 text-gray-400 border border-gray-200 flex items-center justify-center font-medium cursor-not-allowed">
        این مدل ناموجود است
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ۴. بخش انتخاب واریانت (Color/Variant Picker) */}
      {variants.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-gray-700">انتخاب رنگ / مدل:</p>
          <div className="flex flex-wrap gap-3">
            {variants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariantId(variant.id)}
                className={cn(
                  "group relative flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all",
                  selectedVariantId === variant.id
                    ? "border-black bg-black text-white"
                    : "border-gray-100 bg-white text-gray-600 hover:border-gray-300"
                )}
              >
                {variant.colorCode && (
                  <span
                    className="w-4 h-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: variant.colorCode }}
                  />
                )}
                <span className="text-sm font-medium">{variant.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ۵. نمایش قیمت نهایی بر اساس واریانت */}
      {currentVariant?.priceDiff && (
        <p className="text-xs text-blue-600 font-medium">
          +{" "}
          {new Intl.NumberFormat("fa-IR").format(
            Number(currentVariant.priceDiff)
          )}{" "}
          تومان برای این مدل
        </p>
      )}

      {/* ۶. دکمه‌های عملیاتی */}
      <div className="w-full">
        {quantity > 0 ? (
          <div className="animate-in fade-in zoom-in duration-300">
            <CartControls
              itemId={productId}
              variantId={selectedVariantId || undefined} // 👈 ارسال واریانت به کنترلر
              quantity={quantity}
              maxStock={currentStock}
              onUpdate={handleQuantityUpdate}
              className="w-full h-14 bg-white border-2 border-gray-100 shadow-sm"
            />
          </div>
        ) : (
          <AddToCartButton
            productId={productId}
            variantId={selectedVariantId || undefined} // 👈 ارسال واریانت به اکشن خرید
            stock={currentStock}
            onSuccess={() => setQuantity(1)}
          />
        )}
      </div>
    </div>
  );
}
