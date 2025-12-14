"use client";

import { useActionState, useEffect, useState } from "react";
import { createProduct, updateProduct } from "@/actions/products"; // هر دو ایمپورت شوند
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: any; // 👈 داده‌های محصول برای ویرایش
  onSuccess?: () => void;
}

const initialState = { message: "", errors: {}, success: false };

export function ProductForm({
  categories,
  initialData,
  onSuccess,
}: ProductFormProps) {
  // انتخاب اکشن مناسب: اگر دیتای اولیه داریم، یعنی ویرایش است
  const updateProductWithId = initialData
    ? updateProduct.bind(null, initialData.id)
    : null;

  const [state, formAction, isPending] = useActionState(
    initialData ? updateProductWithId! : createProduct,
    initialState
  );

  // اگر ویرایش است، عکس قبلی را نشان بده
  const [preview, setPreview] = useState<string | null>(
    initialData?.images?.[0] || null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("حجم عکس زیاد است");
        return;
      }
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (state.success) {
      toast.success(initialData ? "ویرایش شد" : "ایجاد شد", {
        description: state.message,
      });
      if (onSuccess) onSuccess();
    } else if (state.message) {
      toast.error("خطا", { description: state.message });
    }
  }, [state, onSuccess, initialData]);

  return (
    <form action={formAction} className="space-y-6 py-4">
      {/* عکس */}
      <div className="space-y-2">
        <Label>تصویر محصول</Label>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-4 relative overflow-hidden h-40">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-gray-400">
              <UploadCloud className="mb-2" />
              <span className="text-xs">انتخاب تصویر</span>
            </div>
          )}
          <Input
            type="file"
            name="image"
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageChange}
          />
        </div>
        <p className="text-xs text-muted-foreground text-center">
          {initialData
            ? "اگر عکس جدیدی انتخاب نکنید، عکس قبلی باقی می‌ماند."
            : ""}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>نام محصول</Label>
          <Input
            name="name"
            defaultValue={initialData?.name}
            placeholder="نام محصول"
          />
          {state.errors?.name && (
            <p className="text-red-500 text-xs">{state.errors.name}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>دسته‌بندی</Label>
          <Select name="categoryId" defaultValue={initialData?.categoryId}>
            <SelectTrigger>
              <SelectValue placeholder="انتخاب..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {state.errors?.categoryId && (
            <p className="text-red-500 text-xs">{state.errors.categoryId}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>قیمت (تومان)</Label>
          <Input name="price" type="number" defaultValue={initialData?.price} />
          {state.errors?.price && (
            <p className="text-red-500 text-xs">{state.errors.price}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>موجودی</Label>
          <Input name="stock" type="number" defaultValue={initialData?.stock} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>توضیحات</Label>
        <Textarea name="description" defaultValue={initialData?.description} />
      </div>

      <div className="flex items-center justify-between border p-3 rounded-lg">
        <Label>وضعیت فروش</Label>
        <Switch
          name="isAvailable"
          defaultChecked={initialData ? initialData.isAvailable : true}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="animate-spin" />
        ) : initialData ? (
          "ویرایش تغییرات"
        ) : (
          "ثبت محصول"
        )}
      </Button>
    </form>
  );
}
