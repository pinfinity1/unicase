// تعاریف تایپ در ابتدای فایل UnifiedAuthPage یا یک فایل types
export type AuthStep = "PHONE" | "LOGIN" | "REGISTER" | "OTP";

export interface AuthStepProps {
  setStep: (step: AuthStep) => void;
  phone: string;
}

export interface PhoneStepProps extends AuthStepProps {
  setPhone: (phone: string) => void;
  isPending: boolean;
  startTransition: (callback: () => Promise<void>) => void;
}

export interface RegisterStepProps extends AuthStepProps {
  setPassword: (password: string) => void;
}

export interface OtpStepProps extends AuthStepProps {
  password?: string; // برای مرحله ثبت‌نام الزامی و برای ورود با OTP اختیاری
}
