// src/components/layout/navbar.tsx
import Link from "next/link";
import Image from "next/image"; // 👈 ایمپورت ایمیج
import { Button } from "@/components/ui/button";
import { CartCounter } from "@/components/cart/cart-counter";

export function Navbar() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <header className="w-full max-w-5xl rounded-full border border-white/60 bg-white/70 shadow-lg shadow-gray-200/20 backdrop-blur-2xl transition-all hover:bg-white/80">
        <div className="flex h-14 items-center justify-between px-2 pl-2 pr-6">
          {/* لوگو و نام برند */}
          <Link href="/" className="flex items-center gap-3">
            {/* کانتینر عکس برای کنترل سایز */}
            <div className="relative h-9 w-9 overflow-hidden">
              <Image
                src="/logo/unicase-black.png" // 👈 آدرس لوگوی موجود در پروژه
                alt="UniCase Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900 font-sans">
              UniCase
            </span>
          </Link>

          {/* دکمه‌ها و سبد خرید */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="hidden rounded-full text-gray-500 sm:flex"
              asChild
            >
              <Link href="/admin">پنل مدیریت</Link>
            </Button>

            <div className="h-6 w-px bg-gray-200/50 mx-1" />

            <CartCounter />

            <Button
              asChild
              className="rounded-full px-5 font-bold shadow-none hover:shadow-md transition-all"
            >
              <Link href="/login">ورود</Link>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}
