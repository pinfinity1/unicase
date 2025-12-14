"use client";

import { useActionState, useEffect, useState } from "react";
import { createCategory, updateCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

// تعریف تایپ برای دیتای ورودی (اگر حالت ویرایش باشد)
type CategoryData = {
  id: string;
  name: string;
  slug: string;
};

interface CategoryFormProps {
  initialData?: CategoryData | null; // اگر نال باشد یعنی حالت "ایجاد"
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const initialState = {
  message: "",
  errors: {},
  success: false,
};

export function CategoryForm({
  initialData,
  open: controlledOpen,
  onOpenChange,
}: CategoryFormProps) {
  // مدیریت باز و بسته بودن دیالوگ (چه از بیرون کنترل شود چه از درون)
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // انتخاب اکشن مناسب (آپدیت یا ایجاد)
  const action = initialData
    ? updateCategory.bind(null, initialData.id)
    : createCategory;

  const [state, formAction, isPending] = useActionState(action, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success, setOpen]);

  // هندلر تولید خودکار اسلاگ (فقط در حالت ایجاد)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // اگر در حالت ویرایش هستیم، هیچ کاری نکن (چون اسلاگ نباید خودکار عوض شود)
    if (initialData) return;

    const name = e.target.value;

    // 👈 تغییر اینجاست: چون خط بالا چک کردیم، اینجا مطمئنیم که initialData نداریم.
    // پس نیازی به شرط ternary نیست و ID همیشه "slug" است.
    const slugInput = document.getElementById("slug") as HTMLInputElement;

    if (slugInput && !slugInput.value) {
      slugInput.value = name.trim().toLowerCase().replace(/\s+/g, "-");
    }
  };

  const isEdit = !!initialData;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {/* اگر دکمه تریگر از بیرون کنترل نشود، دکمه پیش‌فرض را نشان بده */}
      {!onOpenChange && (
        <DialogTrigger asChild>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            افزودن دسته‌بندی
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی جدید"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "تغییرات را اعمال و ذخیره کنید."
              : "مشخصات دسته‌بندی را وارد کنید. نامک (Slug) باید یکتا باشد."}
          </DialogDescription>
        </DialogHeader>

        {state.message && !state.success && (
          <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 font-medium">
            ⚠️ {state.message}
          </div>
        )}

        <form action={formAction} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">نام دسته‌بندی</Label>
            <Input
              id="name"
              name="name"
              defaultValue={initialData?.name}
              onChange={handleNameChange}
              placeholder="مثلاً: لوازم جانبی"
              className={cn(state.errors?.name && "border-red-500")}
            />
            {state.errors?.name && (
              <p className="text-xs text-red-500">{state.errors.name[0]}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">نامک (URL)</Label>
            <Input
              id={initialData ? `slug-${initialData.id}` : "slug"}
              name="slug"
              defaultValue={initialData?.slug}
              placeholder="mobile-accessories"
              dir="ltr"
              className={cn(
                "font-mono text-sm",
                state.errors?.slug && "border-red-500"
              )}
            />
            {state.errors?.slug && (
              <p className="text-xs text-red-500 text-right" dir="rtl">
                {state.errors.slug[0]}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 pt-4 border-t gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              انصراف
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {isEdit ? "در حال ویرایش..." : "در حال ذخیره..."}
                </>
              ) : isEdit ? (
                "ویرایش تغییرات"
              ) : (
                "ایجاد دسته‌بندی"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
