import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { ShoppingBag } from "lucide-react";
import { OrderList } from "@/components/admin/orders/order-list";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await requireAdmin();

  const rawOrders = await db.order.findMany({
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 👇 تبدیل تمام فیلدهای Decimal به Number (شامل محصول تو در تو)
  const formattedOrders = rawOrders.map((order) => ({
    ...order,
    totalPrice: order.totalPrice.toNumber(),
    items: order.items.map((item) => ({
      ...item,
      price: item.price.toNumber(),
      product: {
        ...item.product,
        price: item.product.price.toNumber(), // 👈 این خط جا افتاده بود!
        // اگر discountPrice دارید، آن را هم تبدیل کنید:
        // discountPrice: item.product.discountPrice?.toNumber() || null,
      },
    })),
  }));

  if (formattedOrders.length === 0) {
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

      <OrderList orders={formattedOrders} />
    </div>
  );
}
