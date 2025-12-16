import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

// مپ کردن وضعیت‌ها برای نمایش به کاربر
const statusMap: any = {
  PENDING: {
    label: "در انتظار پرداخت",
    icon: Clock,
    color: "bg-yellow-100 text-yellow-700",
  },
  PROCESSING: {
    label: "در حال پردازش",
    icon: CheckCircle,
    color: "bg-blue-100 text-blue-700",
  },
  COMPLETED: {
    label: "تحویل شده",
    icon: Truck,
    color: "bg-green-100 text-green-700",
  },
  CANCELLED: {
    label: "لغو شده",
    icon: XCircle,
    color: "bg-red-100 text-red-700",
  },
};

export default async function MyOrdersPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login");
  }

  // ۱. گرفتن سفارش‌های فقط همین کاربر
  const rawOrders = await db.order.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // ۲. رفع مشکل Decimal
  const orders = rawOrders.map((order) => ({
    ...order,
    totalPrice: order.totalPrice.toNumber(),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      product: {
        ...item.product,
        price: item.product.price.toNumber(),
      },
    })),
  }));

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Package className="h-10 w-10 text-gray-300" />
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          هنوز سفارشی ندارید
        </h1>
        <p className="text-gray-500 mb-8 text-center">
          شما هنوز هیچ خریدی ثبت نکرده‌اید. <br />
          محصولات جذاب ما را از دست ندهید!
        </p>
        <Link
          href="/"
          className="bg-gray-900 text-white px-8 py-3 rounded-2xl font-medium hover:bg-black transition-colors"
        >
          شروع خرید
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-gray-900">سفارش‌های من</h1>
        <Link
          href="/"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1"
        >
          بازگشت به خانه
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-6">
        {orders.map((order) => {
          const statusInfo = statusMap[order.status] || statusMap.PENDING;
          const StatusIcon = statusInfo.icon;

          return (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* هدر کارت: شماره سفارش و وضعیت */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-gray-400">شماره سفارش:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {order.id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("fa-IR", {
                      dateStyle: "long",
                    })}
                  </span>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl self-start sm:self-center ${statusInfo.color}`}
                >
                  <StatusIcon className="h-4 w-4" />
                  <span className="text-xs font-bold">{statusInfo.label}</span>
                </div>
              </div>

              {/* بدنه کارت: عکس محصولات */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="relative h-16 w-16 shrink-0 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden"
                  >
                    {item.product.image ? (
                      <Image
                        src={item.product.image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-gray-300">
                        بدون عکس
                      </div>
                    )}
                    <div className="absolute bottom-0 right-0 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded-tl-lg font-mono">
                      x{item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* فوتر کارت: قیمت کل */}
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-50">
                <span className="text-sm text-gray-500">
                  مبلغ کل پرداخت شده
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-black text-gray-900 font-mono">
                    {new Intl.NumberFormat("fa-IR").format(order.totalPrice)}
                  </span>
                  <span className="text-xs text-gray-500">تومان</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
