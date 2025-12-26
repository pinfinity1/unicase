// src/app/(auth)/login/page.tsx
"use client";

import { useState, useTransition } from "react";
import { PhoneStep } from "@/components/auth/phone-step";
import { LoginStep } from "@/components/auth/login-step";
import { RegisterStep } from "@/components/auth/register-step";
import { OtpStep } from "@/components/auth/otp-step";

export default function UnifiedAuthPage() {
  const [step, setStep] = useState<"PHONE" | "LOGIN" | "REGISTER" | "OTP">(
    "PHONE"
  );

  // ۲. نگهداری داده‌های مشترک بین مراحل
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  // ۳. مدیریت وضعیت بارگذاری سراسری
  const [isPending, startTransition] = useTransition();

  const renderStep = () => {
    switch (step) {
      case "PHONE":
        return (
          <PhoneStep
            setStep={setStep}
            phone={phone}
            setPhone={setPhone}
            isPending={isPending}
            startTransition={startTransition}
          />
        );
      case "LOGIN":
        return <LoginStep setStep={setStep} phone={phone} />;
      case "REGISTER":
        return (
          <RegisterStep
            setStep={setStep}
            phone={phone}
            setPassword={setPassword} // ارسال تابع برای جلوگیری از خطای setPassword is not a function
          />
        );
      case "OTP":
        return (
          <OtpStep
            setStep={setStep}
            phone={phone}
            password={password} // ارسال رمز برای مرحله نهایی ثبت‌نام
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-[380px] transition-all duration-300">
      {/* کارت اصلی با استایل ساده و شکیل */}
      <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-gray-100">
        {renderStep()}
      </div>
    </div>
  );
}
