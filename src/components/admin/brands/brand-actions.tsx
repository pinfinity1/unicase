"use client";

import { useState, useTransition } from "react";
import { deleteBrand } from "@/actions/brands";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Pencil } from "lucide-react"; // Pencil اضافه شد
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { EditBrandDialog } from "./edit-brand-dialog"; // 👈 ایمپورت جدید

// اینترفیس را آپدیت کنید تا کل آبجکت برند را بگیرد
interface BrandActionsProps {
  brand: {
    id: string;
    name: string;
    slug: string;
  };
}

export function BrandActions({ brand }: BrandActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await deleteBrand(brand.id);
        if (res.success) {
          toast.success(res.message);
          setOpen(false);
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        toast.error("خطای غیرمنتظره");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {/* دکمه ویرایش */}
      <EditBrandDialog brand={brand} />

      {/* دکمه حذف */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent className="glass-prism border-red-100">
          {/* همان کد قبلی دیالوگ حذف... */}
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">حذف برند</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              آیا از حذف برند{" "}
              <span className="font-bold text-black">"{brand.name}"</span>{" "}
              اطمینان دارید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isPending}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? "..." : "بله، حذف کن"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
