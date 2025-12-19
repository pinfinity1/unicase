"use client";

import { Address } from "@prisma/client";
import {
  MapPin,
  Plus,
  Check,
  Home,
  Briefcase,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ShippingFormProps {
  addresses: Address[];
  formData: any;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onAddressSelect: (id: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  selectedAddressId?: string | null;
}

export function ShippingForm({
  addresses,
  formData,
  onChange,
  onAddressSelect,
  onSubmit,
  selectedAddressId,
}: ShippingFormProps) {
  const getIcon = (title: string) => {
    if (title.includes("خانه") || title.includes("منزل")) return Home;
    if (title.includes("کار") || title.includes("شرکت")) return Briefcase;
    return MapPin;
  };

  return (
    <div className="space-y-6">
      {/* 1. لیست آدرس‌ها */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">آدرس تحویل</h2>
          </div>

          <div className="flex flex-col gap-2">
            {addresses.map((addr) => {
              const isSelected = selectedAddressId === addr.id;
              const Icon = getIcon(addr.title);

              return (
                <div
                  key={addr.id}
                  onClick={() => onAddressSelect(addr.id)}
                  className={cn(
                    "group relative flex items-center gap-4 rounded-xl border p-3.5 cursor-pointer transition-all duration-200",
                    isSelected
                      ? "border-gray-900 bg-gray-50 ring-1 ring-gray-900"
                      : "border-gray-100 bg-white hover:border-gray-300"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                      isSelected
                        ? "bg-gray-900 text-white"
                        : "bg-gray-100 text-gray-500"
                    )}
                  >
                    {isSelected ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-sm text-gray-900">
                        {addr.title}
                      </span>
                      <span className="text-xs text-gray-400 font-mono hidden sm:inline-block">
                        | {addr.recipientPhone}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {addr.province}، {addr.city}، {addr.fullAddress}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. دکمه افزودن آدرس جدید */}
      <div
        onClick={() => onAddressSelect("new")}
        className={cn(
          "flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-gray-300 cursor-pointer transition-all hover:bg-gray-50",
          selectedAddressId === "new" && "hidden"
        )}
      >
        <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-200">
          <Plus className="h-5 w-5 text-gray-600" />
        </div>
        <span className="text-sm font-medium text-gray-600">
          افزودن آدرس جدید
        </span>
      </div>

      {/* 3. فرم افزودن آدرس جدید */}
      {selectedAddressId === "new" && (
        <div className="animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-sm">
                جزئیات آدرس جدید
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddressSelect(addresses[0]?.id || "")}
                className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                انصراف
              </Button>
            </div>

            {/* چون کل صفحه داخل یک <form> بزرگ در والد است، اینجا فقط div می‌گذاریم */}
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">نام گیرنده</Label>
                  <Input
                    name="recipientName"
                    value={formData.recipientName}
                    placeholder="مثلاً: علی محمدی"
                    required
                    className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white"
                    onChange={onChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">موبایل</Label>
                  <Input
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    placeholder="0912..."
                    required
                    type="tel"
                    className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white font-mono text-right dir-ltr"
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">استان</Label>
                  <Input
                    name="province"
                    value={formData.province}
                    required
                    className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white"
                    onChange={onChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">شهر</Label>
                  <Input
                    name="city"
                    value={formData.city}
                    required
                    className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white"
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">نشانی دقیق</Label>
                <Textarea
                  name="address"
                  value={formData.address}
                  required
                  className="min-h-[80px] bg-gray-50 border-gray-200 focus:bg-white resize-none"
                  onChange={onChange}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">کد پستی</Label>
                <Input
                  name="postalCode"
                  value={formData.postalCode}
                  required
                  className="h-10 text-sm bg-gray-50 border-gray-200 focus:bg-white font-mono text-left dir-ltr"
                  onChange={onChange}
                />
              </div>

              {/* دکمه تایید ظاهری - برای اطمینان کاربر */}
              <div className="pt-2">
                <Button
                  type="button" // تایپ باتن است تا فرم اصلی سابمیت نشود
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    // اینجا می‌توانیم یک تیک سبز نشان دهیم یا فقط بگوییم تایید شد
                    // فعلا فقط یک فیدبک بصری ساده می‌دهیم
                    const element = document.getElementById(
                      "address-confirmed-msg"
                    );
                    if (element) element.style.display = "flex";
                  }}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  تایید این آدرس
                </Button>
                <p
                  id="address-confirmed-msg"
                  className="hidden items-center justify-center text-xs text-green-600 mt-2 font-medium animate-in fade-in"
                >
                  آدرس تایید شد. حالا می‌توانید روش ارسال را انتخاب کنید.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
