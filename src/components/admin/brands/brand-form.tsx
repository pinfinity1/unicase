"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wand2 } from "lucide-react";
import { createBrand, updateBrand } from "@/actions/brands"; // 👈 ایمپورت اکشن جدید
import { toast } from "sonner";
import { slugify } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "حداقل ۲ کاراکتر"),
  slug: z.string().min(2, "الزامی"),
});

type FormData = z.infer<typeof schema>;

// 👇 اضافه کردن پراپ optional برای دیتای اولیه
interface BrandFormProps {
  onSuccess: () => void;
  initialData?: {
    id: string;
    name: string;
    slug: string;
  };
}

export function BrandForm({ onSuccess, initialData }: BrandFormProps) {
  const [isPending, setIsPending] = useState(false);

  // اگر initialData بود، مقادیر پیش‌فرض را ست کن
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      slug: "",
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    form.setValue("name", val);
    // فقط در حالت ایجاد (نه ویرایش) اسلاگ را خودکار عوض کن
    if (!initialData) {
      form.setValue("slug", slugify(val), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("slug", data.slug);

    let res;
    if (initialData) {
      // 👈 حالت ویرایش
      res = await updateBrand(initialData.id, { message: "" }, formData);
    } else {
      // 👈 حالت ایجاد
      res = await createBrand({ message: "" }, formData);
    }

    setIsPending(false);
    if (res.success) {
      toast.success(res.message);
      onSuccess();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
      <div className="space-y-2">
        <Label>نام برند</Label>
        <Input
          {...form.register("name")}
          onChange={handleNameChange}
          placeholder="مثلا: Apple"
        />
        <p className="text-red-500 text-xs">
          {form.formState.errors.name?.message}
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>نامک (Slug)</Label>
          <button
            type="button"
            onClick={() =>
              form.setValue("slug", slugify(form.getValues("slug")))
            }
            className="text-[10px] flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
          >
            <Wand2 className="h-3 w-3" /> استانداردسازی
          </button>
        </div>
        <Input
          {...form.register("slug")}
          dir="ltr"
          className="font-mono text-sm"
        />
        <p className="text-red-500 text-xs">
          {form.formState.errors.slug?.message}
        </p>
      </div>

      <Button disabled={isPending} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "ویرایش برند" : "ثبت برند"}
      </Button>
    </form>
  );
}
