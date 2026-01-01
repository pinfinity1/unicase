"use server";

import { db } from "@/lib/db";
import { requireStaff } from "@/lib/auth-guard";

export async function getDashboardStats() {
  await requireStaff();

  const [userCount, orderCount, lowStockCount, totalRevenueResult] =
    await Promise.all([
      db.user.count(),
      db.order.count(),
      db.product.count({
        where: { stock: { lte: 5 } },
      }),
      db.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: "COMPLETED" },
      }),
    ]);

  const recentOrders = await db.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, phoneNumber: true } },
    },
  });

  return {
    userCount,
    orderCount,
    lowStockCount,
    totalRevenue: totalRevenueResult._sum.totalPrice || 0,
    recentOrders,
  };
}
