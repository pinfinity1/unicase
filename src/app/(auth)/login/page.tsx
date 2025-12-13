"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react"; // آیکون عمومی‌تر انتخاب کردم
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, undefined);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12 text-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-[380px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* هدر عمومی */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/20 ring-4 ring-white mb-6">
            <ShieldCheck className="h-6 w-6" />
          </div>
          {/* تغییر متن: به جای پنل مدیریت، نوشتیم حساب کاربری */}
          <h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
            ورود به حساب کاربری
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            برای ادامه، وارد حساب{" "}
            <span className="font-semibold text-gray-800">UniCase</span> خود
            شوید
          </p>
        </div>

        <div className="bg-white px-6 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border border-gray-100 sm:px-10">
          <form action={formAction} className="space-y-6">
            {state?.message && (
              <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-100 text-center font-medium">
                {state.message}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-semibold text-gray-700"
                >
                  شماره موبایل
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  placeholder="0912..."
                  required
                  dir="ltr"
                  className="h-12 bg-white border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-left px-4 rounded-xl placeholder:text-gray-300 text-gray-900 shadow-sm"
                />
                {state?.errors?.phoneNumber && (
                  <p className="text-xs text-red-500 text-right mt-1 font-medium">
                    {state.errors.phoneNumber}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    رمز عبور
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    فراموشی رمز؟
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  dir="ltr"
                  className="h-12 bg-white border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 text-left px-4 rounded-xl placeholder:text-gray-300 text-gray-900 shadow-sm"
                />
                {state?.errors?.password && (
                  <p className="text-xs text-red-500 text-right mt-1 font-medium">
                    {state.errors.password}
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all duration-300",
                isPending && "opacity-70 cursor-not-allowed hover:translate-y-0"
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  در حال ورود...
                </>
              ) : (
                "ورود"
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-50 text-center">
            <p className="text-xs text-gray-400 font-medium">
              © ۲۰۲۵ UniCase. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
