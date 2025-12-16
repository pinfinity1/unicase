"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
// 👇 ۱. ایمپورت تایپ‌ها
import { Category, Brand } from "@prisma/client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const ProductFormLoading = () => (
  <div className="space-y-4 mt-4">
    <Skeleton className="h-40 w-full rounded-xl" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-full" />
  </div>
);

const ProductForm = dynamic(
  () => import("./product-form").then((mod) => mod.ProductForm),
  {
    ssr: false,
    loading: () => <ProductFormLoading />,
  }
);

// 👇 ۲. اصلاح اینترفیس ورودی
interface ProductFormWrapperProps {
  categories: Category[];
  brands: Brand[]; // 👈 اضافه شد
}

export function ProductFormWrapper({
  categories,
  brands,
}: ProductFormWrapperProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" />
          افزودن محصول جدید
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>افزودن محصول</DialogTitle>
          <DialogDescription>مشخصات محصول جدید را وارد کنید.</DialogDescription>
        </DialogHeader>

        {/* 👇 ۳. پاس دادن برندها به فرم */}
        <ProductForm
          categories={categories}
          brands={brands} // 👈 ✅ این خط مشکل را حل می‌کند
          onSuccess={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
