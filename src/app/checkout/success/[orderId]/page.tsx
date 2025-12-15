import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Copy, Package } from "lucide-react";

interface SuccessPageProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function SuccessPage(props: SuccessPageProps) {
  const params = await props.params;
  const { orderId } = params;

  // دریافت اطلاعات سفارش
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });

  if (!order) return notFound();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        {/* کارت اصلی با افکت شیشه‌ای */}
        <div className="relative overflow-hidden rounded-[32px] bg-white/80 backdrop-blur-xl border border-white/60 shadow-2xl shadow-green-900/5 p-8 text-center">
          {/* دایره سبز متحرک */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100/80 text-green-600 animate-bounce">
            <CheckCircle className="h-12 w-12" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
            سفارش با موفقیت ثبت شد!
          </h1>
          <p className="text-gray-500 mb-8 text-sm">
            از خرید شما سپاسگزاریم. سفارش شما در حال پردازش است.
          </p>

          {/* باکس کد پیگیری */}
          <div className="bg-gray-100/50 rounded-2xl p-4 mb-8 border border-gray-200/50">
            <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">
              شماره سفارش
            </p>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xl font-bold text-gray-800 tracking-wider">
                {order.id.slice(-8).toUpperCase()}
              </span>
              {/* اینجا میشه لاجیک کپی کردن رو اضافه کرد */}
              <Copy className="h-4 w-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>

          {/* جزئیات کوتاه */}
          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">تحویل گیرنده:</span>
              <span className="font-bold text-gray-800">
                {order.recipientName}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">مبلغ کل:</span>
              <span className="font-bold text-gray-800">
                {new Intl.NumberFormat("fa-IR").format(
                  order.totalPrice.toNumber()
                )}{" "}
                تومان
              </span>
            </div>
          </div>

          {/* دکمه بازگشت */}
          <Button
            asChild
            className="w-full h-14 text-lg font-bold rounded-2xl bg-gray-900 hover:bg-black text-white shadow-lg transition-transform active:scale-[0.98]"
          >
            <Link href="/">
              بازگشت به فروشگاه
              <ArrowRight className="mr-2 h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* لینک پیگیری (اختیاری) */}
        <div className="text-center">
          <Link
            href="/profile/orders"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center gap-1"
          >
            <Package className="h-4 w-4" />
            پیگیری وضعیت سفارش
          </Link>
        </div>
      </div>
    </div>
  );
}
