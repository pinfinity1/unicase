"use client";

import { useActionState } from "react";
import { updateProfileInfo, type ProfileFormState } from "@/actions/users";

export default function ProfileForm({
  initialName,
  phoneNumber,
}: {
  initialName: string;
  phoneNumber: string;
}) {
  // مقدار اولیه باید با تایپ ProfileFormState همخوانی داشته باشد (null)
  const initialState: ProfileFormState = null;

  const [state, formAction, isPending] = useActionState(
    updateProfileInfo,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label className=" text-sm mr-2 font-medium">نام و نام خانوادگی</label>
        <input
          name="name"
          defaultValue={initialName}
          placeholder="نام خود را وارد کنید..."
          className="w-full border rounded-2xl p-4  focus:outline-none focus:ring-2 focus:ring-blue-500/40 backdrop-blur-md transition-all"
        />
      </div>

      <div className="space-y-2 opacity-60">
        <label className=" text-sm mr-2 font-medium">
          شماره تماس (تأیید شده)
        </label>
        <div className="w-full bg-black/20 border border-white/5 rounded-2xl p-4  cursor-not-allowed">
          {phoneNumber}
        </div>
      </div>

      {/* نمایش پیام‌های وضعیت با استایل شیشه‌ای */}
      <div className="min-h-[24px]">
        {state?.errors && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
            {state.errors[0]}
          </p>
        )}
        {state?.success && (
          <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
            تغییرات با موفقیت ذخیره شد!
          </p>
        )}
      </div>

      <button
        disabled={isPending}
        className="glass-prism w-full py-4 text-black font-heavy rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
      >
        {isPending ? "در حال ثبت اطلاعات..." : "بروزرسانی پروفایل"}
      </button>
    </form>
  );
}
