"use client";

import { useActionState, useEffect, useState } from "react";
import { createCategory } from "@/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CategoryForm() {
  const [state, formAction, isPending] = useActionState(createCategory, null);
  const [open, setOpen] = useState(false);

  // استیت‌های لوکال برای کنترل اینپوت‌ها
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // ✅ مجیک: وقتی کاربر اسم رو تایپ میکنه، اسلاگ خودکار ساخته میشه
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);

    // تبدیل فاصله به خط تیره برای اسلاگ
    // اگر میخوای فارسی باشه:
    setSlug(val.trim().replace(/\s+/g, "-"));

    // اگر میخوای فقط انگلیسی باشه (اختیاری): باید دستی بنویسن یا از کتابخونه ترجمه استفاده کنی
    // ولی برای الان همین تبدیل فاصله به خط تیره عالیه
  };

  // اگر موفقیت‌آمیز بود، مودال بسته شود
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      setName("");
      setSlug("");
    }
  }, [state?.success]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          افزودن دسته جدید
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25 bg-white">
        <DialogHeader>
          <DialogTitle>ایجاد دسته‌بندی جدید</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-4">
          {state?.message && (
            <div
              className={`p-3 rounded-lg text-sm font-medium ${
                state.success
                  ? "bg-green-50 text-green-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {state.message}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">نام دسته‌بندی</Label>
            <Input
              name="name"
              placeholder="مثلاً: قاب آیفون"
              value={name}
              onChange={handleNameChange} // اتصال به تابع هوشمند
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">نامک (URL)</Label>
            <Input
              name="slug"
              // مقدارش رو از استیت میگیره که خودکار پر میشه
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="پر کردن خودکار..."
              dir="ltr"
              className="font-mono text-sm bg-gray-50"
              required
            />
            <p className="text-[11px] text-muted-foreground">
              به صورت خودکار از روی نام ساخته می‌شود (قابل ویرایش)
            </p>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "ذخیره دسته‌بندی"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
