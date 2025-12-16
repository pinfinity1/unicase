// 📂 src/components/layout/liquid-header.tsx
"use client";

import { useEffect, useState } from "react";

interface LiquidHeaderProps {
  children: React.ReactNode;
}

export function LiquidHeader({ children }: LiquidHeaderProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
        <header
          // 1. اتصال به فیلتر SVG اصلاح شده
          style={{ backdropFilter: "url(#liquid-glass-premium)" }}
          className={`
            relative h-16 rounded-full 
            transition-all duration-500 ease-out
            flex items-center justify-between px-5 sm:px-8
            
            /* --- 💎 تنظیمات شیشه کریستالی (Crystal Glass) --- */
            
            /* رنگ زمینه: سفید بسیار کم‌رنگ */
            bg-white/10
            
            /* سایه: ترکیبی از سایه نرم زیرین و سایه سفید داخلی برای حجم */
            shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1),inset_0_0_20px_rgba(255,255,255,0.2)]
            
            /* بوردر: گرادینت خطی (بالا روشن، پایین محو) */
            border-t border-white/40
            border-b border-white/10
            border-x border-white/20

            /* انیمیشن عرض و موقعیت هنگام اسکرول */
            ${
              scrolled
                ? "w-[90%] max-w-4xl translate-y-1 bg-white/20 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15),inset_0_0_30px_rgba(255,255,255,0.3)]"
                : "w-full max-w-5xl"
            }
          `}
        >
          {/* ✨ لایه درخشش نور (Refractive Highlight)
             این لایه باعث می‌شود بالای هدر مثل لبه گوشی‌های اپل برق بزند 
          */}
          <div className="absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent shadow-[0_0_10px_white]" />

          {/* لایه دوم درخشش برای عمق */}
          <div className="absolute inset-0 rounded-full ring-1 ring-white/30 pointer-events-none mix-blend-overlay" />

          {/* محتوا */}
          {children}
        </header>
      </div>

      {/* 🧪 موتور SVG اصلاح شده (Silky Liquid)
         تغییرات برای حس "پریمیوم":
         1. baseFrequency خیلی پایین (0.006): امواج بسیار بزرگ و نرم (مثل عسل) به جای آب.
         2. numOctaves=1: حذف نویزهای ریز برای سطح صیقلی.
      */}
      <svg className="fixed h-0 w-0 pointer-events-none">
        <defs>
          <filter
            id="liquid-glass-premium"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            {/* تولید موج‌های بسیار نرم و کشیده */}
            <feTurbulence
              type="turbulence"
              baseFrequency="0.010"
              numOctaves="1"
              result="smoothWaves"
            />

            {/* اعوجاج نرم */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="smoothWaves"
              scale="8"
              xChannelSelector="R"
              yChannelSelector="G"
              result="distorted"
            />

            {/* افزایش شفافیت و اشباع رنگ (Vibrancy)
               این باعث می‌شود رنگ‌های پشت هدر زنده و عمیق دیده شوند
            */}
            <feColorMatrix
              type="saturate"
              values="1.8"
              in="distorted"
              result="vibrant"
            />

            {/* یک بلور نهایی خفیف برای ترکیب شدن پیکسل‌ها */}
            <feGaussianBlur in="vibrant" stdDeviation="0.5" />

            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
