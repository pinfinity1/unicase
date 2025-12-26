// src/components/profile/profile-form.tsx
"use client";

import { useActionState } from "react";
import { updateProfileInfo, type ProfileFormState } from "@/actions/users";
import { Loader2, User, Phone, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileForm({
  initialName,
  phoneNumber,
}: {
  initialName: string;
  phoneNumber: string;
}) {
  const initialState: ProfileFormState = null;
  const [state, formAction, isPending] = useActionState(
    updateProfileInfo,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5 lg:space-y-8" dir="rtl">
      {/* ۱. فیلد نام کاربری با استایل شیشه‌ای متحرک */}
      <div className="space-y-2 lg:space-y-3">
        <label className="text-xs lg:text-sm mr-1 font-bold text-gray-700 flex items-center gap-2">
          <User className="h-3.5 w-3.5 opacity-50" />
          نام و نام خانوادگی
        </label>
        <input
          name="name"
          defaultValue={initialName}
          placeholder="نام خود را وارد کنید..."
          className="w-full border-none rounded-[20px] lg:rounded-2xl p-4 lg:p-5 bg-white/60 focus:bg-white/90 focus:ring-4 focus:ring-black/5 backdrop-blur-md transition-all duration-300 outline-none text-sm lg:text-base font-medium shadow-sm"
        />
      </div>

      {/* ۲. فیلد شماره تماس (فقط خواندنی با استایل مات) */}
      <div className="space-y-2 lg:space-y-3 opacity-80">
        <label className="text-xs lg:text-sm mr-1 font-bold text-gray-500 flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 opacity-50" />
          شماره تماس (غیرقابل تغییر)
        </label>
        <div className="w-full bg-black/5 border border-white/20 rounded-[20px] lg:rounded-2xl p-4 lg:p-5 text-gray-500 cursor-not-allowed backdrop-blur-sm text-sm lg:text-base font-mono flex items-center justify-between">
          <span>{phoneNumber}</span>
          <CheckCircle2 className="h-4 w-4 text-green-500/50" />
        </div>
      </div>

      {/* ۳. مدیریت پیام‌های وضعیت (Messages) */}
      <div className="min-h-[30px] transition-all">
        {state?.errors && (
          <div className="flex items-center gap-2 text-red-600 text-xs lg:text-sm bg-red-500/5 border border-red-500/10 p-4 rounded-[20px] animate-in fade-in zoom-in-95">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{state.errors[0]}</p>
          </div>
        )}
        {state?.success && (
          <div className="flex items-center gap-2 text-green-600 text-xs lg:text-sm bg-green-500/5 border border-green-500/10 p-4 rounded-[20px] animate-in fade-in zoom-in-95">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <p>تغییرات با موفقیت در پروفایل UniCase ذخیره شد!</p>
          </div>
        )}
      </div>

      {/* ۴. دکمه ثبت تغییرات (Prism Button) */}
      <button
        disabled={isPending}
        className={cn(
          "w-full py-4 lg:py-5 text-white font-black rounded-[24px] lg:rounded-3xl transition-all duration-500 shadow-xl relative overflow-hidden group",
          isPending
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:scale-[1.02] active:scale-95 shadow-black/20"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <span className="relative z-10 flex items-center justify-center gap-2 text-sm lg:text-base">
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              در حال بروزرسانی...
            </>
          ) : (
            "ثبت تغییرات حساب"
          )}
        </span>
      </button>
    </form>
  );
}
