"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderSummaryProps {
  items: any[];
  subtotal: number;
  shippingCost: number;
  isLoading: boolean;
  onPay: () => void; // 👈 این پراپ جدید اضافه شد
}

export function OrderSummary({
  items,
  subtotal,
  shippingCost,
  isLoading,
  onPay, // 👈 دریافت تابع
}: OrderSummaryProps) {
  const finalTotal = subtotal + shippingCost;
  const formatPrice = (price: number) =>
    new Intl.NumberFormat("fa-IR").format(price);

  return (
    <div className="rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-2xl p-6 shadow-xl shadow-gray-200/50 sticky top-24">
      <h3 className="font-bold text-gray-900 mb-6 text-lg">مرور سفارش</h3>

      {/* لیست آیتم‌ها */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex gap-3 items-center bg-white/50 p-2 rounded-2xl border border-white/40 transition-colors hover:bg-white/80"
          >
            <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-white">
              {item.product.image ? (
                <Image
                  src={item.product.image}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                  بدون عکس
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate mb-1">
                {item.product.name}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>{item.quantity} عدد</span>
                <span className="text-gray-300">|</span>
                <span>{formatPrice(item.product.price)} تومان</span>
              </p>
            </div>
            <div className="text-sm font-mono font-bold text-gray-900 pl-2">
              {formatPrice(item.product.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* محاسبات */}
      <div className="border-t border-gray-200/50 pt-4 space-y-3">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>جمع کل کالاها</span>
          <span className="font-mono font-medium">
            {formatPrice(subtotal)} تومان
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">هزینه ارسال</span>
          <span
            className={cn(
              "font-medium",
              shippingCost === 0 ? "text-green-600" : "text-gray-900 font-mono"
            )}
          >
            {shippingCost === 0
              ? "رایگان"
              : `${formatPrice(shippingCost)} تومان`}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200/50">
        <span className="font-bold text-gray-800 text-lg">مبلغ نهایی</span>
        <span className="text-2xl font-black text-gray-900 font-mono">
          {formatPrice(finalTotal)}{" "}
          <span className="text-sm font-normal text-gray-500 tracking-tighter">
            تومان
          </span>
        </span>
      </div>

      <Button
        type="button" // 👈 تغییر از submit به button
        onClick={onPay} // 👈 فراخوانی مستقیم تابع
        disabled={isLoading}
        className="w-full h-14 mt-6 text-lg font-bold rounded-2xl bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200 transition-all active:scale-[0.98] hover:shadow-xl"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            در حال پردازش...
          </>
        ) : (
          <>
            <CheckCircle className="ml-2 h-5 w-5" />
            ثبت نهایی و پرداخت
          </>
        )}
      </Button>
    </div>
  );
}
