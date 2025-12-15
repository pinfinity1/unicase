// src/app/admin/orders/order-list.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderActions } from "./order-actions";
import { OrderWithDetails } from "@/types";

interface OrderListProps {
  orders: OrderWithDetails[];
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fa-IR").format(price);
};

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const statusMap: Record<
  string,
  { label: string; color: "default" | "secondary" | "destructive" | "outline" }
> = {
  PENDING: { label: "در انتظار پرداخت", color: "secondary" },
  PROCESSING: { label: "در حال پردازش", color: "default" },
  COMPLETED: { label: "تکمیل شده", color: "outline" },
  CANCELLED: { label: "لغو شده", color: "destructive" },
};

export function OrderList({ orders }: OrderListProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="text-right font-bold w-[100px]">
              # شناسه
            </TableHead>
            <TableHead className="text-right">مشتری</TableHead>
            <TableHead className="text-right">تعداد اقلام</TableHead>
            <TableHead className="text-right">مبلغ کل (تومان)</TableHead>
            <TableHead className="text-center">وضعیت</TableHead>
            <TableHead className="text-left">تاریخ ثبت</TableHead>
            <TableHead className="w-[50px]"></TableHead> {/* ستون عملیات */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => {
            const statusInfo = statusMap[order.status] || {
              label: order.status,
              color: "secondary",
            };

            return (
              <TableRow
                key={order.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {order.id.slice(-6)}...
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {order.user?.name || "کاربر مهمان"}
                  <div className="text-xs text-muted-foreground font-mono mt-0.5">
                    {order.user?.phoneNumber}
                  </div>
                </TableCell>
                <TableCell>{order.items.length} محصول</TableCell>
                <TableCell className="font-mono font-medium text-gray-900">
                  {formatPrice(order.totalPrice.toNumber())}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={statusInfo.color} className="font-normal">
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                <TableCell
                  className="text-left text-sm text-gray-500"
                  dir="ltr"
                >
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell>
                  <OrderActions orderId={order.id} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
