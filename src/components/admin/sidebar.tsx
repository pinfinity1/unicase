"use client";

import Link from "next/link";
import Image from "next/image"; // 👈 ۱. ایمپورت کردن Image
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/actions/auth";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  // ShieldCheck, // 👈 دیگه به این آیکون نیاز نداریم
} from "lucide-react";

const menuItems = [
  { title: "داشبورد", href: "/admin", icon: LayoutDashboard },
  { title: "محصولات", href: "/admin/products", icon: Package },
  { title: "دسته‌بندی‌ها", href: "/admin/categories", icon: Layers },
  { title: "سفارش‌ها", href: "/admin/orders", icon: ShoppingBag },
  { title: "کاربران", href: "/admin/users", icon: Users },
  { title: "تنظیمات", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white border-l border-zinc-100">
      {/* لوگو */}
      <div className="flex h-16 items-center px-6 border-b border-zinc-100">
        <Link
          href="/"
          className="flex items-center gap-3 font-bold text-xl text-foreground"
        >
          <div className="relative h-8 w-8 overflow-hidden">
            <Image
              src="/logo/unicase-black.png"
              alt="UniCase Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-primary font-lalezar text-2xl mt-1">
            UniCase
          </span>
        </Link>
      </div>

      {/* لیست منو */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="grid gap-2">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={index}
                href={item.href}
                onClick={onLinkClick}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 -translate-x-0.5"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : "text-zinc-400"
                  )}
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* دکمه خروج */}
      <div className="p-4 border-t border-zinc-100">
        <button
          onClick={() => logoutAction()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}
