import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { Package, ShoppingBag, Users, TrendingUp } from "lucide-react";

export default async function AdminDashboard() {
  await requireAdmin();

  const [productsCount, ordersCount, usersCount] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.user.count(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            داشبورد
          </h1>
          <p className="text-gray-500 text-sm mt-1">خلاصه وضعیت فروشگاه شما</p>
        </div>
        <span className="text-xs font-mono text-gray-400 bg-white/50 px-3 py-1 rounded-full border border-white/60">
          {new Date().toLocaleDateString("fa-IR")}
        </span>
      </div>

      {/* کارت‌های خلاصه وضعیت (Widget Style) */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* ویجت محصولات */}
        <div className="relative overflow-hidden rounded-[32px] border border-white bg-white/80 p-6 shadow-lg shadow-gray-200/50 backdrop-blur-xl transition-transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-blue-500/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">محصولات</p>
              <h3 className="text-4xl font-black text-gray-900 mt-2 font-mono">
                {productsCount.toLocaleString("fa")}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner">
              <Package className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-green-600">
            <TrendingUp className="h-3 w-3" />
            <span>فعال و در دسترس</span>
          </div>
        </div>

        {/* ویجت سفارشات */}
        <div className="relative overflow-hidden rounded-[32px] border border-white bg-white/80 p-6 shadow-lg shadow-gray-200/50 backdrop-blur-xl transition-transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-green-500/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">سفارشات</p>
              <h3 className="text-4xl font-black text-gray-900 mt-2 font-mono">
                {ordersCount.toLocaleString("fa")}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600 shadow-inner">
              <ShoppingBag className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-gray-400">
            <span>تعداد کل سفارشات ثبت شده</span>
          </div>
        </div>

        {/* ویجت کاربران */}
        <div className="relative overflow-hidden rounded-[32px] border border-white bg-white/80 p-6 shadow-lg shadow-gray-200/50 backdrop-blur-xl transition-transform hover:-translate-y-1">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-orange-500/10 blur-2xl" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">کاربران</p>
              <h3 className="text-4xl font-black text-gray-900 mt-2 font-mono">
                {usersCount.toLocaleString("fa")}
              </h3>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 shadow-inner">
              <Users className="h-7 w-7" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs text-gray-400">
            <span>مشتریان ثبت‌نام شده</span>
          </div>
        </div>
      </div>
    </div>
  );
}
