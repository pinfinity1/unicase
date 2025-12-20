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

import { Brand, Category } from "@prisma/client";
import { ProductClient } from "@/types";
// ✅ ایمپورت صحیح (بدون آکولاد چون export default کردیم)
import { ProductForm } from "./product-form";

interface ProductActionsProps {
  product: ProductClient;
  categories: Category[];
  brands: Brand[];
}

export function ProductActions({
  product,
  categories,
  brands,
}: ProductActionsProps) {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
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
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>عملیات</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Edit className="ml-2 h-4 w-4" /> ویرایش
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-red-600 focus:bg-red-50"
          >
            <Trash2 className="ml-2 h-4 w-4" /> حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* مودال ویرایش */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ویرایش محصول: {product.name}</DialogTitle>
          </DialogHeader>

          {/* ✅ اصلاح مهم: استفاده از initialData به جای product */}
          <ProductForm
            categories={categories}
            brands={brands}
            initialData={product} // 👈 اینجا قبلاً product={product} بود که غلط است
            onSuccess={() => setOpenEdit(false)}
          />
        </DialogContent>
      </Dialog>

      {/* مودال حذف */}
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
