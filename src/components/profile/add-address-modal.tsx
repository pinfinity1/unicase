"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// ایمپورت اکشن و ولیدیشن
import { createAddress } from "@/actions/address";
import { addressSchema, AddressFormData } from "@/lib/validations/address";
import { cn } from "@/lib/utils";

interface AddAddressModalProps {
  isMobileFloating?: boolean; // 👈 اضافه کردن این خط برای رفع خطای TypeScript
}

export function AddAddressModal({ isMobileFloating }: AddAddressModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });

  const onSubmit = async (data: AddressFormData) => {
    setIsPending(true);
    try {
      const res = await createAddress(data);
      if (res.success) {
        toast.success(res.message);
        setOpen(false);
        reset(); // فرم را خالی کن
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("خطای غیرمنتظره رخ داد.");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={cn(
            "gap-2 bg-black text-white hover:bg-zinc-800 rounded-2xl transition-all shadow-xl",
            // اگر حالت شناور بود، استایل را تغییر بده
            isMobileFloating &&
              "fixed bottom-24 left-6 h-14 w-14 rounded-full p-0 shadow-2xl z-50 animate-bounce"
          )}
        >
          {isMobileFloating ? (
            <Plus className="h-6 w-6" />
          ) : (
            <>
              <Plus className="h-4 w-4" />
              افزودن آدرس جدید
            </>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5 text-primary" />
            ثبت آدرس جدید
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          {/* عنوان آدرس */}
          <div className="space-y-2">
            <Label>عنوان (مثلاً: خانه، محل کار)</Label>
            <Input {...register("title")} placeholder="خانه" />
            {errors.title && (
              <p className="text-red-500 text-xs">{errors.title.message}</p>
            )}
          </div>

          {/* گیرنده */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>نام تحویل گیرنده</Label>
              <Input {...register("recipientName")} placeholder="علی محمدی" />
              {errors.recipientName && (
                <p className="text-red-500 text-xs">
                  {errors.recipientName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>شماره تماس</Label>
              <Input
                {...register("recipientPhone")}
                placeholder="0912..."
                dir="ltr"
                className="text-right"
              />
              {errors.recipientPhone && (
                <p className="text-red-500 text-xs">
                  {errors.recipientPhone.message}
                </p>
              )}
            </div>
          </div>

          {/* استان و شهر */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>استان</Label>
              <Input {...register("province")} placeholder="تهران" />
              {errors.province && (
                <p className="text-red-500 text-xs">
                  {errors.province.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>شهر</Label>
              <Input {...register("city")} placeholder="تهران" />
              {errors.city && (
                <p className="text-red-500 text-xs">{errors.city.message}</p>
              )}
            </div>
          </div>

          {/* آدرس دقیق */}
          <div className="space-y-2">
            <Label>نشانی پستی کامل</Label>
            <Textarea
              {...register("fullAddress")}
              placeholder="خیابان، کوچه، پلاک، واحد..."
            />
            {errors.fullAddress && (
              <p className="text-red-500 text-xs">
                {errors.fullAddress.message}
              </p>
            )}
          </div>

          {/* کد پستی */}
          <div className="space-y-2">
            <Label>کد پستی (۱۰ رقمی)</Label>
            <Input
              {...register("postalCode")}
              placeholder="1234567890"
              dir="ltr"
              className="text-right font-mono"
            />
            {errors.postalCode && (
              <p className="text-red-500 text-xs">
                {errors.postalCode.message}
              </p>
            )}
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  در حال ثبت...
                </>
              ) : (
                "ثبت آدرس"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
