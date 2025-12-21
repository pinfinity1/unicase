"use client";

import { useActionState, useEffect } from "react";
import { updateSettings } from "@/actions/settings";
import { toast } from "sonner";
import { SubmitButton } from "@/components/ui/submit-button";
import { Store, Phone, Mail, MapPin, Search, Globe } from "lucide-react";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [state, formAction] = useActionState(updateSettings, {
    message: "",
    success: false,
  });

  useEffect(() => {
    if (state.message) {
      if (state.success) toast.success(state.message);
      else toast.error(state.message);
    }
  }, [state]);

  // استایل اینپوت‌ها هماهنگ با تم روشن و شیشه‌ای شما
  const inputClasses = `
    w-full bg-white/60 border border-gray-300/50 rounded-2xl p-4 
    text-zinc-900 placeholder:text-zinc-400 focus:outline-none 
    focus:ring-2 ring-primary/20 focus:bg-white transition-all 
    duration-300 backdrop-blur-sm font-medium
  `;

  const labelClasses =
    "flex items-center gap-2 text-sm font-bold text-zinc-700 mb-2 mr-1";

  return (
    <form action={formAction} className="max-w-4xl mx-auto space-y-10 pb-24">
      {/* بخش هویت برند */}
      <section className="glass-prism rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-zinc-800 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Store className="w-6 h-6 text-primary" />
            </div>
            هویت و برندینگ
          </h2>
          <span className="text-[10px] bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full font-mono">
            SECTION_01
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-1">
            <label className={labelClasses}>نام فروشگاه</label>
            <input
              name="storeName"
              placeholder="UniCase Store"
              defaultValue={initialData?.storeName}
              className={inputClasses}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClasses}>دامنه اصلی (Domain)</label>
            <div className="relative">
              <input
                name="domain"
                dir="ltr"
                placeholder="unicase.ir"
                className={`${inputClasses} pl-12`}
              />
              <Globe className="absolute left-4 top-4 w-5 h-5 text-zinc-400" />
            </div>
          </div>
        </div>
      </section>

      {/* بخش اطلاعات تماس */}
      <section className="glass-prism rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50">
        <h2 className="text-xl font-black text-zinc-800 mb-8 flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-xl">
            <Phone className="w-6 h-6 text-emerald-600" />
          </div>
          ارتباطات
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className={labelClasses}>شماره تماس</label>
            <input
              name="contactPhone"
              dir="ltr"
              defaultValue={initialData?.contactPhone}
              className={inputClasses}
            />
          </div>
          <div>
            <label className={labelClasses}>ایمیل پشتیبانی</label>
            <input
              name="contactEmail"
              dir="ltr"
              defaultValue={initialData?.contactEmail}
              className={inputClasses}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClasses}>آدرس دفتر مرکزی</label>
            <textarea
              name="address"
              rows={3}
              defaultValue={initialData?.address}
              className={`${inputClasses} resize-none leading-relaxed`}
            />
          </div>
        </div>
      </section>

      {/* بخش سئو */}
      <section className="glass-prism rounded-[2.5rem] p-10 shadow-xl shadow-gray-200/50">
        <h2 className="text-xl font-black text-zinc-800 mb-8 flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-xl">
            <Search className="w-6 h-6 text-purple-600" />
          </div>
          تنظیمات گوگل (SEO)
        </h2>

        <div className="space-y-2">
          <label className={labelClasses}>توضیحات متا</label>
          <textarea
            name="description"
            defaultValue={initialData?.description}
            placeholder="درباره فروشگاه خود بنویسید..."
            className={`${inputClasses} h-36 resize-none`}
          />
          <div className="flex justify-end">
            <span className="text-[11px] font-medium text-zinc-400">
              بهترین حالت: ۱۶۰ کاراکتر
            </span>
          </div>
        </div>
      </section>

      {/* دکمه ذخیره فیکس شده در پایین (Floating Dock) */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center px-4 z-[100]">
        <div className="glass-prism p-3 rounded-[2rem] border-white/40 shadow-2xl flex items-center gap-4 min-w-[320px]">
          <SubmitButton
            text="ذخیره تغییرات پیکربندی"
            className="w-full bg-zinc-900 hover:bg-black text-white rounded-2xl py-4 font-bold transition-transform active:scale-95"
          />
        </div>
      </div>
    </form>
  );
}
