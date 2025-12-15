"use client";

import Link from "next/link";
import Image from "next/image";
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
    // ✨ کانتینر شیشه‌ای معلق (Floating Glass)
    <div className="flex h-full flex-col rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/50 shadow-xl shadow-gray-200/50 overflow-hidden">
      {/* هدر سایدبار */}
      <div className="flex h-20 items-center px-6 border-b border-gray-200/50">
        <div className="flex items-center gap-3">
          <Link href={"/"}>
            <div className="relative h-10 w-10 overflow-hidden drop-shadow-md">
              <Image
                src="/logo/unicase-black.png"
                alt="UniCase Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-900 leading-none">
              UniCase
            </span>
            <span className="text-[10px] text-gray-500 font-medium mt-1">
              پنل مدیریت
            </span>
          </div>
        </div>
      </div>

      {/* لیست منو */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={index}
              href={item.href}
              onClick={onLinkClick}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                isActive
                  ? "bg-white shadow-sm text-gray-900" // حالت فعال: سفید و برجسته (مثل مک)
                  : "text-gray-500 hover:bg-white/50 hover:text-gray-900" // حالت هاور: نیمه شفاف
              )}
            >
              {/* آیکون */}
              <div
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActive
                    ? "bg-gray-900 text-white"
                    : "bg-transparent group-hover:bg-gray-100"
                )}
              >
                <item.icon className="h-4 w-4" />
              </div>

              {item.title}

              {/* نشانگر فعال بودن (نقطه کوچک) */}
              {isActive && (
                <div className="mr-auto h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              )}
            </Link>
          );
        })}
      </div>

      {/* فوتر (خروج) */}
      <div className="p-4 border-t border-gray-200/50 bg-white/30">
        <button
          onClick={() => logoutAction()}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          خروج از حساب
        </button>
      </div>
    </div>
  );
}
