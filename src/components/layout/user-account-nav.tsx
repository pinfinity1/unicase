"use client";

import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ChevronDown,
} from "lucide-react";

interface UserAccountNavProps {
  user: Session["user"];
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  return (
    <DropdownMenu modal={false} dir="rtl">
      <DropdownMenuTrigger asChild>
        {/* هماهنگی کامل با استایل CartCounter شما */}
        <button className="group relative flex h-10 items-center gap-1 rounded-full border border-white/50 bg-white/40 px-2 backdrop-blur-md shadow-sm transition-all duration-300 hover:bg-white/60 hover:shadow-md active:scale-95 cursor-pointer">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900/10 text-gray-900 transition-transform group-hover:scale-110">
            <User className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <ChevronDown className="h-3 w-3 text-gray-600 transition-transform group-data-[state=open]:rotate-180" />
        </button>
      </DropdownMenuTrigger>

      {/* محتوای دراپ‌داون با پشتیبانی از RTL و استایل شیشه‌ای */}
      <DropdownMenuContent
        align="end"
        className="w-64 mt-2 overflow-hidden rounded-3xl border border-white/40 bg-white/80 p-2 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        {/* هدر دراپ‌داون */}
        <div className="flex flex-col space-y-1 p-3 text-right">
          <div className="flex items-center justify-between">
            <p className="text-sm font-black text-gray-900">
              {user.name || "کاربر خوش‌آمدید"}
            </p>
            {user.role === "ADMIN" && (
              <span className="rounded-full bg-black px-2 py-0.5 text-[9px] font-bold text-white tracking-tighter">
                مدیر سیستم
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-500 font-medium dir-ltr text-right">
            {user.phoneNumber}
          </p>
        </div>

        <DropdownMenuSeparator className="bg-gray-200/50" />

        {/* آیتم‌های منو */}
        <div className="space-y-1">
          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl py-2.5 focus:bg-gray-900/5"
          >
            <Link
              href="/profile"
              className="flex items-center gap-3 text-gray-700"
            >
              <Settings className="h-4 w-4 opacity-70" />
              <span className="text-sm font-bold">تنظیمات حساب</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            asChild
            className="cursor-pointer rounded-xl py-2.5 focus:bg-gray-900/5"
          >
            <Link
              href="/profile/orders"
              className="flex items-center gap-3 text-gray-700"
            >
              <Package className="h-4 w-4 opacity-70" />
              <span className="text-sm font-bold">سفارش‌های من</span>
            </Link>
          </DropdownMenuItem>

          {user.role === "ADMIN" && (
            <DropdownMenuItem
              asChild
              className="cursor-pointer rounded-xl py-2.5 bg-primary/5 focus:bg-primary/10 text-primary"
            >
              <Link href="/admin" className="flex items-center gap-3">
                <LayoutDashboard className="h-4 w-4" />
                <span className="text-sm font-black">پنل مدیریت UniCase</span>
              </Link>
            </DropdownMenuItem>
          )}
        </div>

        <DropdownMenuSeparator className="bg-gray-200/50" />

        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/" })}
          className="cursor-pointer rounded-xl py-2.5 text-red-600 focus:bg-red-50 focus:text-red-700 flex items-center gap-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-black">خروج از حساب</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
