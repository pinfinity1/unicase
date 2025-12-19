import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Truck } from "lucide-react";

import { ShippingCreateForm } from "@/components/admin/shipping/shipping-create-form";
import { ShippingList } from "@/components/admin/shipping/shipping-list";

export default async function AdminShippingPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/");

  // دریافت لیست خام از دیتابیس
  const rawMethods = await db.shippingMethod.findMany({
    orderBy: { createdAt: "desc" },
  });

  // 👇 تبدیل Decimal به number برای جلوگیری از ارور
  const methods = rawMethods.map((method) => ({
    ...method,
    price: method.price.toNumber(), // تبدیل حیاتی
  }));

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* هدر صفحه */}
      <div className="flex items-center gap-3 border-b pb-6">
        <div className="bg-blue-100 p-3 rounded-xl text-blue-600 shadow-sm">
          <Truck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            مدیریت روش‌های ارسال
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            تعریف هزینه و روش‌های ارسال سفارشات
          </p>
        </div>
      </div>

      {/* ۱. فرم افزودن */}
      <ShippingCreateForm />

      {/* ۲. لیست روش‌ها */}
      <ShippingList methods={methods} />
    </div>
  );
}
