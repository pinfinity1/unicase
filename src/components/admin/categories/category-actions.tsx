"use client";

import { useState } from "react";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Category } from "@prisma/client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger, // 👈 اضافه شد
} from "@/components/ui/dialog"; // 👈 اضافه شد
import { Button } from "@/components/ui/button";
import { deleteCategory } from "@/actions/categories";

// 👇 ایمپورت فرمی که ساختید
import { CategoryForm } from "./category-form";

interface CategoryActionsProps {
  // این تایپ رو قبلاً درست کردیم
  category: Category & {
    _count?: {
      products: number;
    };
  };
}

export function CategoryActions({ category }: CategoryActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false); // مدیریت باز/بسته بودن مودال
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = async () => {
    setIsLoading(true);
    try {
      const result = await deleteCategory(category.id);
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("خطای سیستمی");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* مودال ویرایش */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">منو</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuLabel>عملیات</DropdownMenuLabel>

            {/* دکمه‌ای که مودال را باز می‌کند */}
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="mr-2 h-4 w-4" />
                ویرایش
              </DropdownMenuItem>
            </DialogTrigger>

            <DropdownMenuItem
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* محتوای مودال */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش دسته‌بندی</DialogTitle>
          </DialogHeader>

          {/* 👇 رفع خطا اینجاست: 
            ما دیگه open={open} رو به فرم نمیدیم.
            به جاش میگیم هروقت موفق شد (onSuccess)، مودال رو ببند (setOpen(false))
          */}
          <CategoryForm
            initialData={category}
            onSuccess={() => {
              setOpen(false); // بستن مودال بعد از موفقیت
              router.refresh(); // رفرش صفحه برای دیدن تغییرات
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
