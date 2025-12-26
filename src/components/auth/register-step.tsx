// src/components/auth/register-step.tsx
"use client";

import { useState } from "react";
import { sendOtpAction } from "@/actions/auth";
import { AuthField } from "@/components/auth/auth-field";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { RegisterStepProps } from "@/types/UnifiedAuthPage";

export function RegisterStep({
  setStep,
  phone,
  setPassword,
}: RegisterStepProps) {
  const [loading, setLoading] = useState(false);
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // ۱. اعتبارسنجی اولیه کلاینت
    if (pass.length < 6) return setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
    if (pass !== confirm) return setError("رمز عبور و تایید آن مطابقت ندارند");

    setLoading(true);

    // ۲. ارسال کد OTP قبل از حرکت به مرحله بعد
    const result = await sendOtpAction(phone);

    if (result.success) {
      setPassword(pass); // ذخیره در استیت والد برای استفاده در registerAction
      setStep("OTP"); // انتقال به مرحله تایید شماره
    } else {
      setError(result.message || "خطا در ارسال کد تایید");
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 text-right"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-gray-900">تعیین رمز عبور</h2>
        <p className="text-xs text-gray-400">
          یک رمز عبور امن برای حساب خود انتخاب کنید.
        </p>
      </div>

      <form onSubmit={handleNext} noValidate className="space-y-4">
        <AuthField
          label="رمز عبور"
          type="password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <AuthField
          label="تکرار رمز عبور"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        {error && <p className="text-[10px] text-red-500 font-bold">{error}</p>}

        <Button
          disabled={loading}
          className="w-full h-12 bg-black text-white rounded-xl hover:bg-zinc-800 transition-all font-semibold"
        >
          {loading ? (
            <Loader2 className="animate-spin size-5" />
          ) : (
            "تایید و دریافت کد"
          )}
        </Button>

        <button
          type="button"
          onClick={() => setStep("PHONE")}
          className="w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-black transition-colors"
        >
          <ChevronRight className="size-4" /> تغییر شماره موبایل
        </button>
      </form>
    </motion.div>
  );
}
