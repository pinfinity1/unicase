// مسیر فایل: src/app/admin/page.tsx
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { Package, ShoppingBag, Users } from "lucide-react";

export default async function AdminDashboard() {
  // ۱. گارد امنیتی (محض احتیاط، هرچند میدلور هم هست)
  await requireAdmin();

  // ۲. دریافت آمار به صورت موازی (برای سرعت بالاتر)
  const [productsCount, ordersCount, usersCount] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">داشبورد مدیریت</h1>
      </div>

      {/* کارت‌های خلاصه وضعیت */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* کارت محصولات */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              تعداد محصولات
            </h3>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {productsCount}
            </div>
          </div>
          <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Package className="h-6 w-6" />
          </div>
        </div>

        {/* کارت سفارشات */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              سفارشات ثبت شده
            </h3>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {ordersCount}
            </div>
          </div>
          <div className="h-12 w-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </div>

        {/* کارت کاربران */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">
              کاربران کل
            </h3>
            <div className="mt-2 text-3xl font-bold text-gray-900">
              {usersCount}
            </div>
          </div>
          <div className="h-12 w-12 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
