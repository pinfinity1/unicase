"use client";

import { useState, useTransition } from "react";
import { deleteProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Trash2, Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProductForm } from "./product-form"; // استفاده از فرم خودمان

export function ProductActions({
  product,
  categories,
}: {
  product: any;
  categories: any[];
}) {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false); // مودال ویرایش
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteProduct(product.id);
      if (res.success) {
        toast.success(res.message);
        setOpenDelete(false);
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>عملیات</DropdownMenuLabel>

          {/* دکمه باز کردن مودال ویرایش */}
          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Edit className="ml-2 h-4 w-4" /> ویرایش
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* دکمه باز کردن مودال حذف */}
          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-red-600 focus:bg-red-50"
          >
            <Trash2 className="ml-2 h-4 w-4" /> حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ۱. مودال ویرایش */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ویرایش محصول: {product.name}</DialogTitle>
          </DialogHeader>
          {/* فرم را صدا می‌زنیم و دیتای فعلی محصول را به آن می‌دهیم */}
          <ProductForm
            categories={categories}
            initialData={product}
            onSuccess={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* ۲. مودال حذف (Alert) */}
      <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف محصول؟</AlertDialogTitle>
            <AlertDialogDescription>
              آیا مطمئن هستید؟ این محصول و تصاویر آن کاملاً حذف می‌شوند.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              {isPending ? <Loader2 className="animate-spin" /> : "بله، حذف کن"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
