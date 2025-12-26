// src/components/auth/otp-step.tsx
"use client";

import { useActionState, useRef, useEffect, useState } from "react";
import { registerAction, verifyOtpAction, sendOtpAction } from "@/actions/auth";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, RefreshCcw } from "lucide-react";
import { OtpStepProps } from "@/types/UnifiedAuthPage";

export function OtpStep({ setStep, phone, password }: OtpStepProps) {
  // ۱. تشخیص اکشن مورد نظر: اگر پسورد داشتیم ثبت‌نام، در غیر این صورت ورود ساده
  const targetAction = password ? registerAction : verifyOtpAction;
  const [state, formAction, isPending] = useActionState(
    targetAction,
    undefined
  );

  const [timer, setTimer] = useState(120); // تایمر ۲ دقیقه‌ای مشابه دیجی‌کالا
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 text-right"
      dir="rtl"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">تایید شماره موبایل</h2>
        <p className="text-[11px] text-gray-400">
          کد تایید برای شماره{" "}
          <span className="font-bold text-gray-700 tabular-nums">{phone}</span>{" "}
          ارسال شد.
        </p>
      </div>

      <form ref={formRef} action={formAction} noValidate className="space-y-8">
        {/* داده‌های مخفی برای اکشن‌های سرور */}
        <input type="hidden" name="phoneNumber" value={phone} />
        {password && (
          <>
            <input type="hidden" name="password" value={password} />
            <input type="hidden" name="confirmPassword" value={password} />
          </>
        )}

        <div className="flex flex-col items-center gap-4 w-full">
          <InputOTP
            maxLength={6}
            name="token"
            autoFocus
            inputMode="numeric"
            pattern="^[0-9]*$"
            onComplete={() => formRef.current?.requestSubmit()} // ارسال خودکار پس از تکمیل کد
          >
            <InputOTPGroup dir="ltr">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="size-12 border-gray-100 font-medium focus:border-black focus:!ring-0 transition-all"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <AnimatePresence>
            {state?.message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] text-red-500 font-bold"
              >
                {state.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <Button
            disabled={isPending}
            className="w-full h-12 rounded-xl bg-black text-white hover:bg-zinc-800 transition-all font-semibold"
          >
            {isPending ? (
              <Loader2 className="animate-spin size-5" />
            ) : (
              "تایید نهایی"
            )}
          </Button>

          <div className="flex justify-between items-center px-1">
            {timer > 0 ? (
              <span className="text-[10px] text-gray-400 font-medium">
                ارسال مجدد کد تا{" "}
                <span className="tabular-nums text-gray-700 font-bold">
                  {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, "0")}
                </span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  sendOtpAction(phone);
                  setTimer(120);
                }} // بازنشانی تایمر
                className="text-[10px] text-black font-bold flex items-center gap-1 hover:underline"
              >
                <RefreshCcw className="size-3" /> ارسال مجدد کد
              </button>
            )}

            <button
              type="button"
              onClick={() => setStep(password ? "REGISTER" : "LOGIN")}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-black transition-colors font-medium"
            >
              ویرایش اطلاعات <ArrowRight className="size-3 rotate-180" />
            </button>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
