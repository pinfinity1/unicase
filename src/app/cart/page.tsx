"use client";

import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import useStore from "@/hooks/use-store";
import { CartControls } from "@/components/cart/cart-controls";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CartPage() {
  // استفاده از هوک برای جلوگیری از ارور Hydration
  const items = useStore(useCartStore, (state) => state.items);
  const totalPrice = useStore(useCartStore, (state) => state.getTotalPrice());

  // حالت لودینگ اولیه
  if (items === undefined) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <span className="animate-pulse text-gray-400 font-medium">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  // حالت سبد خالی
  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-100 text-gray-300 shadow-inner">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            سبد خرید شما خالی است
          </h2>
          <p className="text-gray-500">هنوز محصولی را انتخاب نکرده‌اید.</p>
        </div>
        <Button
          asChild
          size="lg"
          className="mt-4 rounded-2xl bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200"
        >
          <Link href="/">مشاهده محصولات</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
          سبد خرید
        </h1>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* لیست محصولات (ستون سمت راست) */}
          <div className="lg:col-span-8 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row gap-4 rounded-3xl border border-white bg-white p-4 shadow-sm transition-all hover:shadow-md"
              >
                {/* عکس محصول */}
                <Link
                  href={`/products/${item.slug}`}
                  className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-100"
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      بدون تصویر
                    </div>
                  )}
                </Link>

                {/* جزئیات و کنترلر */}
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">
                      <Link
                        href={`/products/${item.slug}`}
                        className="hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </h3>
                    <div className="text-left">
                      <div className="font-bold text-gray-900 text-lg">
                        {new Intl.NumberFormat("fa-IR").format(
                          item.price * item.quantity
                        )}
                        <span className="text-xs font-normal text-gray-500 mr-1">
                          تومان
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 sm:mt-0">
                    <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                      <ShieldCheck className="h-3 w-3" />
                      <span>ضمانت اصالت</span>
                    </div>

                    {/* استفاده از کنترلر iOS Style */}
                    <CartControls
                      productId={item.id}
                      maxStock={item.maxStock}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* خلاصه فاکتور (ستون سمت چپ - Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            {/* ✨ افکت شیشه‌ای (Glassmorphism) واقعی روی زمینه خاکستری */}
            <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                خلاصه سفارش
              </h3>

              <div className="space-y-4 border-b border-gray-100 pb-6 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>مجموع اقلام ({items.length})</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("fa-IR").format(totalPrice || 0)}{" "}
                    تومان
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>هزینه ارسال</span>
                  <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-lg text-xs">
                    رایگان
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-900 font-bold">
                  مبلغ قابل پرداخت
                </span>
                <span className="text-2xl font-black text-gray-900 font-mono">
                  {new Intl.NumberFormat("fa-IR").format(totalPrice || 0)}
                  <span className="text-sm font-normal text-gray-500 mr-2 tracking-tighter">
                    تومان
                  </span>
                </span>
              </div>

              <Button
                asChild
                className="w-full h-14 text-lg font-bold rounded-2xl bg-gray-900 hover:bg-black text-white shadow-xl shadow-gray-200 transition-transform active:scale-[0.98]"
              >
                <Link href="/checkout">
                  تکمیل خرید
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-400">
                  ثبت سفارش به منزله پذیرش قوانین است.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
