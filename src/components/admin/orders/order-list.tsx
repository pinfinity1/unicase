import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderActions } from "./order-actions";
import { OrderWithDetails } from "@/types";
import { cn } from "@/lib/utils";

interface OrderListProps {
  orders: OrderWithDetails[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fa-IR").format(price);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short", // ماه کوتاه زیباتر است
    day: "numeric",
  });
};

// استایل بج‌های وضعیت (iOS Style)
const statusStyles: Record<string, string> = {
  PENDING: "bg-orange-100 text-orange-700 border-orange-200", // در انتظار
  PROCESSING: "bg-blue-100 text-blue-700 border-blue-200", // در حال پردازش
  COMPLETED: "bg-green-100 text-green-700 border-green-200", // تکمیل شده
  CANCELLED: "bg-red-100 text-red-700 border-red-200", // لغو شده
};

const statusLabels: Record<string, string> = {
  PENDING: "در انتظار پرداخت",
  PROCESSING: "در حال پردازش",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
};

export function OrderList({ orders }: OrderListProps) {
  return (
    <div className="rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="border-b border-gray-200/50 hover:bg-transparent">
            <TableHead className="w-24 text-right pr-6 text-gray-500">
              شناسه
            </TableHead>
            <TableHead className="text-right text-gray-500">مشتری</TableHead>
            <TableHead className="text-right text-gray-500">
              مبلغ (تومان)
            </TableHead>
            <TableHead className="text-center text-gray-500">اقلام</TableHead>
            <TableHead className="text-center text-gray-500">وضعیت</TableHead>
            <TableHead className="text-left pl-6 text-gray-500">
              تاریخ
            </TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="border-b border-gray-100/50 hover:bg-white/60 transition-colors"
            >
              <TableCell className="pr-6 font-mono text-xs text-gray-400">
                #{order.id.slice(-6).toUpperCase()}
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  {/* اولویت با recipientName است که جدید اضافه کردیم */}
                  <span className="font-bold text-gray-800 text-sm">
                    {order.recipientName || order.user?.name || "کاربر مهمان"}
                  </span>
                  <span className="text-[11px] text-gray-500 font-mono mt-0.5">
                    {order.recipientPhone || order.user?.phoneNumber}
                  </span>
                </div>
              </TableCell>

              <TableCell className="font-mono font-bold text-gray-900 text-base">
                {formatPrice(order.totalPrice.toNumber())}
              </TableCell>

              <TableCell className="text-center">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
                  {order.items.length} کالا
                </span>
              </TableCell>

              <TableCell className="text-center">
                <span
                  className={cn(
                    "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border",
                    statusStyles[order.status] || "bg-gray-100 text-gray-600"
                  )}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </TableCell>

              <TableCell
                className="text-left pl-6 text-xs text-gray-500"
                dir="ltr"
              >
                {formatDate(order.createdAt)}
              </TableCell>

              <TableCell>
                <OrderActions orderId={order.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
