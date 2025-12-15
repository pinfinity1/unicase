"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// 👇 فرم هوشمندی که ساختیم رو اینجا صدا می‌زنیم
import { CategoryForm } from "./category-form";

export function CategoryFormWrapper() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          افزودن دسته‌بندی
        </Button>
      </DialogTrigger>

      {/* محتوای مودال */}
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>ایجاد دسته‌بندی جدید</DialogTitle>
          <DialogDescription>
            مشخصات دسته‌بندی را وارد کنید. نامک به صورت خودکار ساخته می‌شود.
          </DialogDescription>
        </DialogHeader>

        {/* 👇 فرم رو اینجا می‌ذاریم.
          وقتی فرم کارش تموم شد (onSuccess)، مودال رو می‌بندیم.
        */}
        <CategoryForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
