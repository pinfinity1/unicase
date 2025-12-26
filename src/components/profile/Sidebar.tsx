// src/components/profile/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, MapPin, LogOut, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react"; // اضافه کردن قابلیت خروج

const menuItems = [
  { name: "اطلاعات حساب", href: "/profile", icon: User },
  { name: "سفارش‌های من", href: "/profile/orders", icon: ShoppingBag },
  { name: "آدرس‌های من", href: "/profile/addresses", icon: MapPin },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-row lg:flex-col gap-2 p-1 overflow-x-auto lg:overflow-x-visible scrollbar-hide"
      dir="rtl"
    >
      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center shrink-0 lg:justify-between px-4 py-3 lg:px-5 lg:py-4 transition-all duration-300 rounded-[20px] lg:rounded-[24px]",
              isActive
                ? "bg-white/80 shadow-md scale-[1.02] text-black"
                : "text-gray-600 hover:bg-white/40"
            )}
          >
            <div className="flex items-center gap-3 lg:gap-4">
              <div
                className={cn(
                  "flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl transition-all duration-500",
                  isActive ? "bg-black text-white" : "bg-black/5"
                )}
              >
                <item.icon
                  className="h-4 w-4 lg:h-5 lg:w-5"
                  strokeWidth={2.2}
                />
              </div>
              <span
                className={cn(
                  "font-bold text-xs lg:text-sm whitespace-nowrap",
                  isActive ? "opacity-100" : "opacity-70"
                )}
              >
                {item.name}
              </span>
            </div>
            {isActive && <ChevronLeft className="hidden lg:block h-4 w-4" />}
          </Link>
        );
      })}

      {/* دکمه خروج در دسکتاپ جدا می‌شود، در موبایل کنار بقیه می‌ماند */}
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="flex items-center gap-3 lg:gap-4 px-4 py-3 lg:px-5 lg:py-4 text-red-500 hover:bg-red-50/50 transition-all rounded-[20px] lg:rounded-[24px] shrink-0"
      >
        <div className="flex h-8 w-8 lg:h-10 lg:w-10 items-center justify-center rounded-xl bg-red-50">
          <LogOut className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2.5} />
        </div>
        <span className="font-black text-xs lg:text-sm whitespace-nowrap">
          خروج
        </span>
      </button>
    </nav>
  );
}
