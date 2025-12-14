"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Loader2, AlertTriangle } from "lucide-react";
import { deleteCategory } from "@/actions/categories";
import { CategoryForm } from "./category-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCategory(category.id);
      if (result.success) {
        setOpenDelete(false);
      } else {
        setDeleteError(result.message || "خطایی رخ داد");
      }
    });
  };

  return (
    <div className="flex items-center justify-center gap-2">
      {/* دکمه ویرایش */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50"
        onClick={() => setOpenEdit(true)}
      >
        <Pencil className="h-4 w-4" />
      </Button>

      {/* مودال ویرایش (از کامپوننت فرم استفاده می‌کند) */}
      <CategoryForm
        initialData={category}
        open={openEdit}
        onOpenChange={setOpenEdit}
      />

      {/* دکمه حذف */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
        onClick={() => {
          setDeleteError(""); // ریست کردن ارور قبلی
          setOpenDelete(true);
        }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* دیالوگ تایید حذف */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-100">
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

          {/* نمایش ارور اگر حذف ناموفق بود (مثلاً محصول داشت) */}
          {deleteError && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md text-center border border-red-100">
              {deleteError}
            </div>
          )}

          <DialogFooter className="mt-2 sm:justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setOpenDelete(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
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
    </div>
  );
}
