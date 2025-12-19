"use client";

import { useRef } from "react";
import { createShippingMethod } from "@/actions/shipping";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useFormStatus } from "react-dom";

// دکمه سابمیت جداگانه برای هندل کردن وضعیت لودینگ
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-blue-600 hover:bg-blue-700 w-full md:w-auto"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : "افزودن"}
    </Button>
  );
}

export function ShippingCreateForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const price = Number(formData.get("price"));
    const description = formData.get("description") as string;

    if (!name || isNaN(price)) {
      toast.error("لطفاً نام و قیمت معتبر وارد کنید");
      return;
    }

    const result = await createShippingMethod({ name, price, description });

    if (result.success) {
      toast.success(result.message);
      formRef.current?.reset(); // خالی کردن فرم
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm">
      <h2 className="font-bold mb-6 flex items-center gap-2 text-gray-700">
        <Plus className="w-5 h-5" /> افزودن روش جدید
      </h2>
      <form
        ref={formRef}
        action={handleSubmit}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-500">عنوان روش</label>
          <Input
            name="name"
            required
            placeholder="مثلاً: پست پیشتاز"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-500">
            هزینه (تومان)
          </label>
          <Input
            name="price"
            type="number"
            required
            placeholder="35000"
            className="rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-500">
            توضیحات (زمان)
          </label>
          <Input
            name="description"
            placeholder="2 الی 3 روز کاری"
            className="rounded-xl"
          />
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
