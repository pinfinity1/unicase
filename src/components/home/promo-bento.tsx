import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function PromoBento() {
  return (
    <section className="mb-24 px-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2 h-[600px] md:h-[500px]">
        {/* باکس اصلی بزرگ (سمت راست) */}
        <div className="relative col-span-1 md:col-span-2 md:row-span-2 overflow-hidden rounded-[32px] bg-gray-900 p-8 text-white group">
          <div className="absolute top-0 right-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/30 via-transparent to-transparent" />
          <div className="flex h-full flex-col justify-between items-start z-10 relative">
            <div>
              <span className="mb-2 inline-block rounded-full bg-blue-600 px-3 py-1 text-xs font-bold">
                پیشنهاد ویژه
              </span>
              <h3 className="text-3xl font-black md:text-5xl mt-2 leading-tight">
                جشنواره <br /> تابستانه UniCase
              </h3>
              <p className="mt-4 max-w-xs text-gray-300">
                تخفیف‌های شگفت‌انگیز روی تمام قاب‌های سیلیکونی و چرمی.
              </p>
            </div>
            <Button
              variant="secondary"
              className="rounded-full px-6 font-bold hover:scale-105 transition-transform"
            >
              خرید با تخفیف
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Button>
          </div>
          {/* افکت هاور عکس */}
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/30 transition-colors" />
        </div>

        {/* باکس بالا چپ */}
        <div className="relative overflow-hidden rounded-[32px] bg-[#F5F5F7] p-6 border border-white/60 group">
          <div className="flex flex-col h-full justify-center items-center text-center">
            <h4 className="text-xl font-bold text-gray-900">ارسال رایگان</h4>
            <p className="text-sm text-gray-500 mt-1">
              برای خریدهای بالای ۱ میلیون
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-green-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* باکس پایین چپ */}
        <div className="relative overflow-hidden rounded-[32px] bg-white border border-gray-100 p-6 shadow-sm group">
          <div className="flex flex-col h-full justify-between">
            <div>
              <h4 className="text-xl font-bold text-gray-900">لوازم جانبی</h4>
              <p className="text-sm text-gray-500">کابل، شارژر و محافظ</p>
            </div>
            <Link
              href="/accessories"
              className="self-end rounded-full bg-gray-100 p-2 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-900" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
