"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Link as LinkIcon, Wand2 } from "lucide-react";
import { createCategory, updateCategory } from "@/actions/categories";
import { toast } from "sonner";
import { slugify } from "@/lib/utils"; // 👈 تابع جدید
import { Category } from "@prisma/client";

// ولیدیشن
const CategorySchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ حرف باشد"),
  slug: z
    .string()
    .min(2, "نامک الزامی است")
    .regex(
      /^[a-z0-9\u0600-\u06FF\-]+$/,
      "فرمت نامک صحیح نیست (فقط حروف، اعداد و خط تیره)"
    ),
});

type FormData = z.infer<typeof CategorySchema>;

interface CategoryFormProps {
  initialData?: Category | null;
  onSuccess?: () => void;
}

export function CategoryForm({ initialData, onSuccess }: CategoryFormProps) {
  const [isPending, setIsPending] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
    },
  });

  // 👇 لاجیک هوشمند: وقتی نام تغییر کرد، اسلاگ هم ساخته بشه
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("name", value);

    // فقط اگر داریم دسته‌بندی جدید میسازیم (یا اسلاگ خالیه) این کار رو بکن
    // تا اگر ادمین دستی اسلاگ رو عوض کرده بود، ما خرابش نکنیم
    if (!initialData) {
      form.setValue("slug", slugify(value), { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsPending(true);
    try {
      const result = initialData
        ? await updateCategory(initialData.id, data)
        : await createCategory(data);

      if (result.success) {
        toast.success(result.message);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("خطای غیرمنتظره");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>نام دسته‌بندی</Label>
        <Input
          {...form.register("name")}
          onChange={handleNameChange} // اتصال هندلر هوشمند
          placeholder="مثلاً: قاب موبایل"
          className="bg-gray-50 focus:bg-white transition-all"
        />
        {form.formState.errors.name && (
          <p className="text-xs text-red-500">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1 text-gray-600">
            <LinkIcon className="h-3 w-3" />
            نامک (Slug) - مناسب برای سئو
          </Label>

          {/* دکمه تمیزکاری دستی */}
          <button
            type="button"
            onClick={() =>
              form.setValue("slug", slugify(form.getValues("slug")))
            }
            className="text-[10px] flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
          >
            <Wand2 className="h-3 w-3" />
            استانداردسازی
          </button>
        </div>

        <Input
          {...form.register("slug")}
          dir="ltr" // اسلاگ همیشه چپ‌چین باشه بهتره
          className="font-mono text-sm bg-gray-50 focus:bg-white transition-all text-left"
        />
        <p className="text-[10px] text-gray-400">
          این متن در آدرس مرورگر نمایش داده می‌شود. (مثال:
          domain.com/category/mobile-case)
        </p>
        {form.formState.errors.slug && (
          <p className="text-xs text-red-500">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>

      <div className="pt-4">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی"}
        </Button>
      </div>
    </form>
  );
}
