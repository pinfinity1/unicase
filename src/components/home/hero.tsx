import Image from "next/image";

export function Hero() {
  return (
    <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-white pt-24 pb-12">
      {/* 🎨 1. پس‌زمینه: استیج نورانی (Lighting Stage) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* نور اصلی بالا (Spotlight) - تمرکز روی محصول */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[80%] h-[600px] rounded-full bg-gradient-to-b from-blue-50 to-transparent blur-[100px] opacity-80" />

        {/* اورب‌های رنگی برای شکست نور در هدر شیشه‌ای */}
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-purple-100/30 rounded-full blur-[120px] mix-blend-multiply animate-pulse" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-indigo-50/40 rounded-full blur-[100px] mix-blend-multiply" />

        {/* پترن شبکه (Grid) - خیلی محو برای حس مهندسی */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* نویز (Grain) برای بافت سینمایی */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* محو کننده پایین (Fade out) */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      {/* 📦 2. محتوای اصلی: فقط تصویر */}
      <div className="container relative z-10 px-4 w-full h-full flex flex-col items-center justify-center">
        {/* کانتینر تصویر با انیمیشن ورود */}
        <div className="relative w-full max-w-[1100px] animate-in fade-in zoom-in-95 duration-1000 ease-out">
          {/* افکت درخشش پشت خود محصول (Glow) */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-blue-400/10 blur-[90px] rounded-full -z-10" />

          {/* قاب شیشه‌ای دور محصول (اختیاری - اگر نمی‌خواهید حذفش کنید) */}
          <div className="relative aspect-[16/8] md:aspect-[21/9] w-full overflow-hidden rounded-[3rem] border border-white/60 bg-white/20 backdrop-blur-sm shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] ring-1 ring-white/50">
            {/* ⚠️ نکته مهم: عکس hero-mockup.png باید کیفیت بسیار بالا داشته باشد */}
            <Image
              src="/hero-mockup.png"
              alt="UniCase Premium Showcase"
              fill
              className="object-cover md:object-contain scale-105 hover:scale-100 transition-transform duration-[2000ms]"
              priority
            />

            {/* انعکاس نور روی شیشه قاب */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
