"use client";

import { useState, useTransition } from "react";
import { deleteCategory } from "@/actions/categories";
import { CategoryForm } from "./category-form";
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface CategoryActionsProps {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [isDeleting, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.success) {
        toast.success(result.message);
        setOpenDelete(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <>
      {/* منوی عملیات (سه نقطه) - دقیقاً مشابه محصولات */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">باز کردن منو</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>عملیات</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => setOpenEdit(true)}>
            <Edit className="ml-2 h-4 w-4" />
            ویرایش
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setOpenDelete(true)}
            className="text-red-600 focus:bg-red-50"
          >
            <Trash2 className="ml-2 h-4 w-4" />
            حذف
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* مودال ویرایش */}
      <CategoryForm
        initialData={category}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />

      {/* دیالوگ تایید حذف */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-center">حذف دسته‌بندی</DialogTitle>
            <DialogDescription className="text-center">
              آیا از حذف دسته‌بندی{" "}
              <span className="font-bold text-foreground">
                "{category.name}"
              </span>{" "}
              مطمئن هستید؟
              <br />
              این عملیات غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-2 gap-2 sm:justify-center">
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              disabled={isDeleting}
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  در حال حذف...
                </>
              ) : (
                "بله، حذف کن"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
