import { auth } from "@/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { MapPin, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// 👇 تغییر ۱: ایمپورت مودال جدید
import { AddAddressModal } from "@/components/profile/add-address-modal";
// 👇 برای دکمه حذف هم یک اکشن سرور کوچک همینجا می‌نویسیم
import { deleteAddress } from "@/actions/address";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">دفترچه آدرس‌های من</h1>

        {/* 👇 تغییر ۲: استفاده از دکمه افزودن */}
        <div className="hidden md:block">
          <AddAddressModal />
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <MapPin className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">هنوز آدرسی ثبت نکرده‌اید</p>
          <AddAddressModal />
        </div>
      ) : (
        <div className="grid gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="group relative p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {addr.title}
                    </h3>
                    {addr.isDefault && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                        پیش‌فرض
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {addr.province}، {addr.city}، {addr.fullAddress}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium">
                    <div className="flex items-center gap-1">
                      <span>کد پستی:</span>
                      <span className="font-mono text-gray-600">
                        {addr.postalCode}
                      </span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-1">
                      <span>گیرنده:</span>
                      <span className="text-gray-600">
                        {addr.recipientName}
                      </span>
                    </div>
                    <div className="w-1 h-1 bg-gray-300 rounded-full" />
                    <div className="flex items-center gap-1">
                      <span>تماس:</span>
                      <span className="font-mono text-gray-600">
                        {addr.recipientPhone}
                      </span>
                    </div>
                  </div>
                </div>

                {/* دکمه حذف */}
                <form
                  action={async () => {
                    "use server";
                    await deleteAddress(addr.id);
                  }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600 -mt-2 -ml-2"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* دکمه شناور موبایل */}
      <div className="fixed bottom-6 left-6 md:hidden z-10">
        <AddAddressModal />
      </div>
    </div>
  );
}
