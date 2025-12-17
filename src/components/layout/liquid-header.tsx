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
          // فقط همین کلاس را صدا می‌زنید!
          className={`
    glass-prism 
    h-16 rounded-full flex items-center justify-between px-5 sm:px-8
    transition-all duration-500 ease-out
    ${scrolled ? "w-[90%] max-w-4xl translate-y-1" : "w-full max-w-5xl"}
  `}
        >
          {/* فقط افکت‌های نوری اضافی (مثل درخشش لبه) را اینجا نگه دارید */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-200/50 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.5)] z-20" />

          <div className="relative z-30 flex items-center justify-between w-full">
            {children}
          </div>
        </header>
      </div>

      {/* 🧪 موتور SVG منشوری (Prismatic Engine) */}
    </>
  );
}
