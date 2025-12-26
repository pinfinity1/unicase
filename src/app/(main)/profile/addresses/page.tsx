// src/app/(main)/profile/addresses/page.tsx
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AddAddressModal } from "@/components/profile/add-address-modal";
import { EmptyAddressState } from "@/components/profile/addresses/empty-address-state";
import { AddressCard } from "@/components/profile/addresses/address-card";

export default async function AddressesPage() {
  const session = await auth(); //
  if (!session?.user) redirect("/login");

  const addresses = await db.address.findMany({
    where: { userId: session.user.id }, //
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto py-4 lg:py-10" dir="rtl">
      {/* هدر صفحه */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">
            دفترچه آدرس‌ها
          </h1>
          <p className="text-xs lg:text-sm text-gray-500 mt-1 font-medium">
            مدیریت محل‌های تحویل سفارش UniCase
          </p>
        </div>
        <div className="hidden md:block scale-110">
          <AddAddressModal />
        </div>
      </div>

      {/* نمایش لیست یا وضعیت خالی */}
      {addresses.length === 0 ? (
        <EmptyAddressState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {addresses.map((addr) => (
            <AddressCard key={addr.id} addr={addr as any} />
          ))}
        </div>
      )}

      {/* دکمه شناور موبایل */}
      <div className="fixed bottom-24 left-6 md:hidden z-50">
        <AddAddressModal isMobileFloating />
      </div>
    </div>
  );
}
