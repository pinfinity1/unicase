"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface OrderActionsProps {
  orderId: string;
}

export function OrderActions({ orderId }: OrderActionsProps) {
  const handleCopyId = () => {
    navigator.clipboard.writeText(orderId);
    toast.success("شناسه سفارش کپی شد");
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">باز کردن منو</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>عملیات</DropdownMenuLabel>

        <DropdownMenuItem onClick={handleCopyId}>
          کپی شناسه سفارش
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => toast.info("بخش مشاهده جزئیات هنوز پیاده‌سازی نشده")}
        >
          <Eye className="ms-2 h-4 w-4" />
          مشاهده جزئیات
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => toast.error("امکان حذف سفارش فعلاً وجود ندارد")}
          className="text-red-600 focus:bg-red-50"
        >
          <Trash2 className="ms-2 h-4 w-4" />
          حذف سفارش
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
