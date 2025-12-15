"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Trash2,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  MapPin,
  Phone,
  User,
  Package,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatus, deleteOrder } from "@/actions/orders";
import { OrderStatus } from "@prisma/client";
import Image from "next/image";
import { FormattedOrder } from "./order-list";

interface OrderActionsProps {
  order: FormattedOrder;
}

const statusMap: Record<
  OrderStatus,
  { label: string; icon: any; color: string }
> = {
  PENDING: { label: "در انتظار پرداخت", icon: Clock, color: "text-yellow-600" },
  PROCESSING: {
    label: "در حال پردازش",
    icon: CheckCircle,
    color: "text-blue-600",
  },
  COMPLETED: {
    label: "تکمیل / ارسال شده",
    icon: Truck,
    color: "text-green-600",
  },
  CANCELLED: { label: "لغو شده", icon: XCircle, color: "text-red-600" },
};

export function OrderActions({ order }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showDetails, setShowDetails] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(order.id);
    toast.success("شناسه سفارش کپی شد");
  };

  const handleChangeStatus = (status: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, status as OrderStatus);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  const handleDelete = () => {
    if (!confirm("آیا از حذف این سفارش مطمئن هستید؟")) return;

    startTransition(async () => {
      const res = await deleteOrder(order.id);
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    });
  };

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">باز کردن منو</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>عملیات سفارش</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => setShowDetails(true)}
            className="cursor-pointer"
          >
            <Eye className="ml-2 h-4 w-4" />
            مشاهده جزئیات کامل
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleCopyId} className="cursor-pointer">
            <Copy className="ml-2 h-4 w-4" />
            کپی شناسه سفارش
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Truck className="ml-2 h-4 w-4" />
              <span>تغییر وضعیت</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              <DropdownMenuRadioGroup
                value={order.status}
                onValueChange={handleChangeStatus}
              >
                {Object.keys(statusMap).map((key) => {
                  const statusKey = key as OrderStatus;
                  const { label, icon: Icon, color } = statusMap[statusKey];
                  return (
                    <DropdownMenuRadioItem
                      key={key}
                      value={key}
                      className="cursor-pointer"
                    >
                      <Icon className={`ml-2 h-4 w-4 ${color}`} />
                      {label}
                    </DropdownMenuRadioItem>
                  );
                })}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:bg-red-50 focus:text-red-600 cursor-pointer"
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف سفارش
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>جزئیات سفارش</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* ۱. اطلاعات گیرنده */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">نام گیرنده</p>
                  <p className="font-medium text-gray-900">
                    {order.recipientName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">شماره تماس</p>
                  <p className="font-medium text-gray-900 font-mono">
                    {order.recipientPhone}
                  </p>
                </div>
              </div>
            </div>

            {/* ۲. آدرس (اصلاح شده: حذف province) */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-white flex items-center justify-center shadow-sm text-gray-500">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">آدرس ارسال</p>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {order.city}، {order.address}
                </p>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  کد پستی: {order.postalCode}
                </p>
              </div>
            </div>

            {/* ۳. لیست محصولات */}
            <div>
              <h4 className="flex items-center gap-2 font-bold text-gray-900 mb-4">
                <Package className="h-5 w-5" />
                اقلام سفارش
              </h4>
              <div className="border border-gray-100 rounded-xl overflow-hidden">
                {order.items.map((item) => {
                  // 👇 افزودن گارد امنیتی: اگر محصول حذف شده بود یا لود نشده بود
                  if (!item.product) {
                    return (
                      <div
                        key={item.id}
                        className="p-3 bg-red-50 text-red-600 text-xs border-b border-red-100"
                      >
                        محصول یافت نشد (حذف شده) - قیمت:{" "}
                        {new Intl.NumberFormat("fa-IR").format(
                          Number(item.price)
                        )}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50/50"
                    >
                      <div className="relative h-16 w-16 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-gray-300">
                            عکس ندارد
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm line-clamp-1">
                          {item.product.name}
                        </p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-xs text-gray-500">
                            تعداد: {item.quantity}
                          </span>
                          <span className="text-xs font-mono font-bold text-gray-700">
                            {new Intl.NumberFormat("fa-IR").format(
                              Number(item.price)
                            )}{" "}
                            تومان
                          </span>
                        </div>
                      </div>
                      <div className="font-mono font-black text-sm text-gray-900 pl-2">
                        {new Intl.NumberFormat("fa-IR").format(
                          Number(item.price) * item.quantity
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ۴. جمع کل */}
            <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-xl shadow-lg shadow-gray-200">
              <span className="text-sm font-medium opacity-90">
                مبلغ کل پرداخت شده
              </span>
              <span className="text-xl font-black font-mono">
                {new Intl.NumberFormat("fa-IR").format(
                  Number(order.totalPrice)
                )}
                <span className="text-xs font-normal opacity-70 mr-2">
                  تومان
                </span>
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
