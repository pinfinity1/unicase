import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CartCounter } from "@/components/cart/cart-counter";
import { SearchTrigger } from "../search/search-trigger";

export function Navbar() {
  return (
    <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <header className="w-full max-w-5xl rounded-full border border-white/60 bg-white/70 shadow-lg shadow-gray-200/20 backdrop-blur-2xl transition-all hover:bg-white/80">
        <div className="flex h-14 items-center justify-between px-4 sm:px-6">
          {/* بخش راست: لوگو */}
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden">
              <Image
                src="/logo/unicase-black.png"
                alt="UniCase Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="hidden sm:block text-xl font-black tracking-tight text-gray-900 font-sans">
              UniCase
            </span>
          </Link>

          {/* بخش وسط: حذف شد (SearchTrigger از اینجا رفت) */}

          {/* بخش چپ: دکمه‌ها (سرچ + سبد + لاگین) */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* 👇 سرچ آمد اینجا */}
            <SearchTrigger />

            <div className="h-6 w-px bg-gray-200/50 mx-1 hidden sm:block" />

            <CartCounter />

            <Button
              asChild
              className="hidden sm:flex rounded-full px-5 font-bold shadow-none hover:shadow-md transition-all"
            >
              <Link href="/login">ورود</Link>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}
