// src/components/home/category-rail.tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Smartphone,
  Headphones,
  Watch,
  Zap,
  Cable, // جایگزین Battery برای شارژر (مرتبط‌تر)
  ShieldCheck, // برای گلس و محافظ
} from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  {
    id: "iphone",
    name: "iPhone",
    icon: Smartphone,
    href: "/category/iphone",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    id: "audio",
    name: "AirPods",
    icon: Headphones,
    href: "/category/audio",
    color: "text-purple-600",
    bg: "bg-purple-500/10",
  },
  {
    id: "watch",
    name: "Watch",
    icon: Watch,
    href: "/category/watch",
    color: "text-red-600",
    bg: "bg-red-500/10",
  },
  {
    id: "charging",
    name: "Charging",
    icon: Zap,
    href: "/category/charging",
    color: "text-yellow-600",
    bg: "bg-yellow-500/10",
  },
  {
    id: "accessories",
    name: "Protection",
    icon: ShieldCheck,
    href: "/category/accessories",
    color: "text-teal-600",
    bg: "bg-teal-500/10",
  },
];

export function CategoryRail() {
  return (
    <section className="relative w-full flex justify-center py-10">
      {/* Container: کپسول شیشه‌ای شناور */}
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} // افکت فنری نرم
        className="
          relative z-10 
          flex items-center gap-2 sm:gap-4 p-2 sm:p-3
          rounded-full 
          bg-white/40 backdrop-blur-2xl 
          border border-white/60 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]
          ring-1 ring-white/40
        "
      >
        {categories.map((cat) => (
          <CategoryItem key={cat.id} category={cat} />
        ))}
      </motion.div>

      {/* نور پس‌زمینه محو برای جدا کردن داک از زمینه */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-20 bg-gray-200/50 blur-[80px] -z-10 rounded-full" />
    </section>
  );
}

function CategoryItem({ category }: { category: (typeof categories)[0] }) {
  return (
    <Link href={category.href} className="relative group">
      <motion.div
        whileHover="hover"
        initial="initial"
        className="relative flex flex-col items-center justify-center cursor-pointer"
      >
        {/* ۱. آیکون باکس */}
        <motion.div
          variants={{
            initial: { scale: 1, y: 0 },
            hover: { scale: 1.15, y: -5 }, // بزرگنمایی و بالا رفتن موقع هاور
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className={cn(
            "relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full transition-colors duration-300 border border-transparent",
            "bg-white/60 group-hover:bg-white shadow-sm group-hover:shadow-lg group-hover:border-white/80",
            category.color // رنگ آیکون
          )}
        >
          <category.icon
            className="h-6 w-6 sm:h-7 sm:w-7 relative z-10"
            strokeWidth={1.5}
          />

          {/* هاله رنگی پشت آیکون (فقط موقع هاور ظاهر می‌شود) */}
          <motion.div
            variants={{
              initial: { opacity: 0, scale: 0.5 },
              hover: { opacity: 1, scale: 1.2 },
            }}
            className={cn(
              "absolute inset-0 rounded-full blur-xl opacity-0",
              category.bg
            )}
          />
        </motion.div>

        {/* ۲. لیبل متنی (مخفی است و موقع هاور ظاهر می‌شود) */}
        <motion.span
          variants={{
            initial: { opacity: 0, y: 5, height: 0 },
            hover: { opacity: 1, y: 0, height: "auto" },
          }}
          transition={{ duration: 0.2 }}
          className="absolute -bottom-8 whitespace-nowrap text-[10px] font-bold text-gray-500 uppercase tracking-wider bg-white/80 backdrop-blur px-2 py-0.5 rounded-full border border-gray-100 shadow-sm"
        >
          {category.name}
        </motion.span>

        {/* ۳. نقطه نشانگر فعال (اختیاری) */}
        <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.div>
    </Link>
  );
}
