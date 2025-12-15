// src/app/admin/orders/page.tsx
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { OrderList } from "./order-list";
import { ShoppingBag } from "lucide-react";

export default async function OrdersPage() {
  await requireAdmin();

  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: true,
      items: true,
    },
  });

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center bg-gray-50/50 mt-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">سفارشی یافت نشد</h3>
        <p className="text-sm text-gray-500 mt-2">
          هنوز هیچ سفارشی در سیستم ثبت نشده است.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-6">
        <h1 className="text-3xl font-bold text-gray-900">لیست سفارشات</h1>
      </div>

      <OrderList orders={orders} />
    </div>
  );
}
