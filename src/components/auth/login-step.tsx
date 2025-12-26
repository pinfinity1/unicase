// src/components/auth/login-step.tsx
"use client";

import { useActionState, useState } from "react";
import { loginAction, sendOtpAction } from "@/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface LoginStepProps {
  setStep: (step: "PHONE" | "LOGIN" | "REGISTER" | "OTP") => void;
  phone: string;
}

export function LoginStep({ setStep, phone }: LoginStepProps) {
  // ۱. مدیریت وضعیت اکشن ورود
  const [state, formAction, isPending] = useActionState(loginAction, undefined);
  const [otpLoading, setOtpLoading] = useState(false);

  // ۲. مدیریت درخواست ورود با کد تایید (فراموشی رمز)
  const handleOtpRequest = async () => {
    setOtpLoading(true);
    const result = await sendOtpAction(phone); // ارسال کد به شماره فعلی
    if (result.success) {
      setStep("OTP"); // جابجایی به مرحله تایید کد
    }
    setOtpLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-right"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">خوش آمدید</h2>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          رمز عبور حساب{" "}
          <span className="font-bold text-gray-700 tabular-nums">{phone}</span>{" "}
          را وارد کنید.
        </p>
      </div>

      <form action={formAction} noValidate className="space-y-6">
        {/* فیلد مخفی برای ارسال شماره به اکشن سرور */}
        <input type="hidden" name="phoneNumber" value={phone} />

        <div className="space-y-4">
          <AuthField
            label="رمز عبور"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            autoFocus
            error={state?.errors?.password} // نمایش خطاهای اعتبارسنجی Zod
          />

          {state?.message && !state.success && (
            <p className="text-[10px] text-red-500 font-bold px-1">
              {state.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Button
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-black text-white hover:bg-zinc-900 transition-all font-semibold shadow-sm"
          >
            {isPending ? (
              <Loader2 className="animate-spin size-5" />
            ) : (
              "ورود به حساب"
            )}
          </Button>

          <button
            type="button"
            disabled={otpLoading}
            onClick={handleOtpRequest}
            className="w-full py-1 text-[11px] font-bold text-zinc-400 hover:text-black transition-colors"
          >
            {otpLoading
              ? "در حال ارسال کد..."
              : "ورود با کد یکبار مصرف (فراموشی رمز)"}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setStep("PHONE")}
          className="flex items-center justify-center w-full text-[10px] text-gray-400 gap-1 hover:text-black transition-colors"
        >
          <ArrowRight className="size-3" /> تغییر شماره موبایل
        </button>
      </form>
    </motion.div>
  );
}
