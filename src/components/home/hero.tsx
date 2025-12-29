// src/components/home/hero.tsx
import Image from "next/image";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

export function Hero() {
  return (
    <section className="relative h-dvh w-full overflow-hidden bg-white flex flex-col items-center justify-center">
      {/* 🎨 ۱. پس‌زمینه زنده (Ambient Background) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* گرادینت‌های متحرک */}
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
        <div className="absolute top-[10%] right-[-10%] w-[60vw] h-[60vw] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-200/40 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />

        {/* ✅ اصلاح شده: تولید نویز با کد SVG (بدون نیاز به فایل png) */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* 🔡 ۲. تایپوگرافی هنری */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <h1 className="text-[18vw] font-black text-gray-900/10 tracking-tighter leading-none blur-sm transform scale-150 whitespace-nowrap">
          UNICASE
        </h1>
      </div>

      {/* 📦 ۳. ویترین محصول */}
      <div className="relative z-10 w-full max-w-5xl px-4 flex flex-col items-center">
        <div className="relative group perspective-1000">
          {/* دایره مغناطیسی پشت محصول */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-white/80 to-white/20 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

          {/* خود تصویر محصول */}
          <div className="relative w-[300px] md:w-[450px] aspect-[4/5] animate-float">
            {/* ⚠️ حتماً مطمئن شوید فایل hero-mockup.png در پوشه public وجود دارد */}
            <Image
              src="/hero-mockup.png"
              alt="Premium Case"
              fill
              className="object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105 group-hover:-rotate-2"
              priority
            />

            {/* انعکاس شیشه‌ای */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[3rem]" />
          </div>

          {/* تگ قیمت/خرید */}
          <Link
            href="/products/iphone-15-silicone"
            className="absolute -bottom-6 -right-4 md:bottom-10 md:-right-10 backdrop-blur-xl bg-white/30 border border-white/50 p-4 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.1)] flex items-center gap-4 transition-transform hover:scale-105 hover:bg-white/50 group/tag"
          >
            <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center text-white">
              <ArrowDown className="h-5 w-5 -rotate-45 transition-transform group-hover/tag:rotate-0" />
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Latest Drop
              </span>
              <span className="text-sm font-black text-gray-900">
                iPhone 15 Pro Max
              </span>
            </div>
          </Link>
        </div>
      </div>

      {/* ⬇️ ۴. اسکرول ایندیکیتور */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
        <span className="text-[10px] tracking-[0.3em] font-medium uppercase text-gray-400">
          Explore
        </span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-gray-300 to-transparent" />
      </div>
    </section>
  );
}
