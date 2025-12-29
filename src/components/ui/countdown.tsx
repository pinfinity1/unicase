"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function Countdown() {
  // تنظیم زمان پایان روی ۱۲ ساعت آینده (به صورت فرضی برای دمو)
  // در واقعیت این می‌تواند از دیتابیس بیاید
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 0, s: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return prev; // زمان تمام شد
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1.5 border border-red-500/20 backdrop-blur-md">
      <Clock className="h-3.5 w-3.5 text-red-600 animate-pulse" />
      <span className="font-mono text-sm font-bold text-red-600 tabular-nums tracking-widest">
        {format(timeLeft.h)}:{format(timeLeft.m)}:{format(timeLeft.s)}
      </span>
    </div>
  );
}
