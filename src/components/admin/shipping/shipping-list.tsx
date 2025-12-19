"use client";

import { ShippingMethod } from "@prisma/client";
import { deleteShippingMethod } from "@/actions/shipping";
import { Button } from "@/components/ui/button";
import { Trash2, Truck } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ShippingListProps {
  methods: any[]; // یا تایپ دقیق ShippingMethod که فیلد price آن Decimal است
}

export function ShippingList({ methods }: ShippingListProps) {
  const router = useRouter();

  const handleDelete = async (id: string) => {
    // تاییدیه حذف (اختیاری)
    if (!confirm("آیا از حذف این روش اطمینان دارید؟")) return;

    const res = await deleteShippingMethod(id);
    if (res.success) {
      toast.success(res.message);
      router.refresh(); // رفرش کردن صفحه برای دیدن تغییرات
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      {/* هدر جدول */}
      <div className="hidden md:grid p-4 bg-gray-50 border-b font-medium text-gray-500 text-sm grid-cols-12 gap-4">
        <div className="col-span-4">نام روش</div>
        <div className="col-span-4">توضیحات</div>
        <div className="col-span-3">هزینه ارسال</div>
        <div className="col-span-1">عملیات</div>
      </div>

      <div className="divide-y">
        {methods.map((m) => (
          <div
            key={m.id}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50/50 transition-colors"
          >
            <div className="col-span-12 md:col-span-4 font-bold text-gray-800 flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-400 md:hidden" />
              {m.name}
            </div>

            <div className="col-span-12 md:col-span-4 text-sm text-gray-500">
              <span className="md:hidden font-medium text-gray-700 ml-1">
                توضیحات:
              </span>
              {m.description || "-"}
            </div>

            <div className="col-span-12 md:col-span-3 font-mono font-bold text-blue-600 flex items-center justify-between md:justify-start">
              <span className="md:hidden font-medium text-gray-700">
                هزینه:
              </span>
              {Number(m.price) === 0
                ? "رایگان"
                : `${new Intl.NumberFormat("fa-IR").format(
                    Number(m.price)
                  )} تومان`}
            </div>

            <div className="col-span-12 md:col-span-1 flex justify-end md:justify-start">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(m.id)}
                className="text-red-500 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}

        {methods.length === 0 && (
          <div className="p-10 text-center text-gray-400 flex flex-col items-center gap-3">
            <div className="bg-gray-50 p-4 rounded-full">
              <Truck className="w-8 h-8 opacity-40" />
            </div>
            <p>هنوز روش ارسالی تعریف نشده است.</p>
          </div>
        )}
      </div>
    </div>
  );
}
