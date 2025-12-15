import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderActions } from "./order-actions";
import { OrderStatus, User } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

// 👇 تعریف دقیق ساختار دیتایی که پاس دادیم
export type FormattedOrder = {
  id: string;
  recipientName: string;
  recipientPhone: string;
  totalPrice: number; // number شده
  status: OrderStatus;
  createdAt: Date;
  city: string;
  address: string;
  postalCode: string;
  user: User | null;
  items: {
    id: string;
    price: number; // number شده
    quantity: number;
    product: {
      id: string;
      name: string;
      image: string | null;
      price: number; // 👈 مهم: این هم number شده
      stock: number;
      // بقیه فیلدهای پروداکت که نیاز دارید...
    };
  }[];
};

interface OrderListProps {
  orders: FormattedOrder[];
}

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200"
        >
          در انتظار
        </Badge>
      );
    case "PROCESSING":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          در حال پردازش
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          تکمیل شده
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          لغو شده
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export function OrderList({ orders }: OrderListProps) {
  return (
    <div className="rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent border-gray-100">
            <TableHead className="text-right w-[100px]">شماره</TableHead>
            <TableHead className="text-right">گیرنده</TableHead>
            <TableHead className="text-right">مبلغ کل</TableHead>
            <TableHead className="text-center">وضعیت</TableHead>
            <TableHead className="text-center">تاریخ</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              className="hover:bg-white/50 border-gray-100 transition-colors"
            >
              <TableCell className="font-mono font-medium">
                {order.id.slice(-6).toUpperCase()}
              </TableCell>

              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">
                    {order.recipientName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {order.recipientPhone}
                  </span>
                </div>
              </TableCell>

              <TableCell className="font-mono font-bold">
                {new Intl.NumberFormat("fa-IR").format(order.totalPrice)}
              </TableCell>

              <TableCell className="text-center">
                {getStatusBadge(order.status)}
              </TableCell>

              <TableCell className="text-center text-xs text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("fa-IR")}
              </TableCell>

              <TableCell>
                <OrderActions order={order} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
