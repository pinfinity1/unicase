// 📂 src/components/layout/navbar.tsx
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CartCounter } from "@/components/cart/cart-counter";
import { SearchTrigger } from "../search/search-trigger";
import { LiquidHeader } from "./liquid-header"; // ایمپورت پوسته کلاینت
import { auth } from "@/auth";
import { UserAccountNav } from "./user-account-nav";

export async function Navbar() {
  const session = await auth();

  return (
    <LiquidHeader>
      {/* --- محتوای داخلی (توسط سرور رندر می‌شود) --- */}

      {/* لوگو */}
      <Link href="/" className="relative z-10 flex items-center gap-3 group">
        <div className="relative h-10 w-10 transition-transform duration-500 group-hover:rotate-12">
          <Image
            src="/logo/unicase-black.png"
            alt="UniCase Logo"
            fill
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>
        <span className="hidden sm:block text-xl font-black tracking-tight text-gray-900/90 font-sans mix-blend-hard-light">
          UniCase
        </span>
      </Link>

      {/* دکمه‌ها */}
      <div className="relative z-10 flex items-center gap-2">
        <SearchTrigger />

        <div className="h-5 w-[1.5px] bg-gray-900/10 mx-2 hidden sm:block rounded-full mix-blend-multiply" />

        {/* حالا CartCounter بدون خطا کار می‌کند چون در سرور رندر می‌شود */}
        <CartCounter />

        <div className="flex items-center gap-2">
          {session ? (
            // نمایش دراپ‌داون پروفایل به جای دکمه ورود
            <UserAccountNav user={session.user} />
          ) : (
            <Button
              asChild
              className="rounded-full px-6 font-bold bg-gray-900 text-white shadow-lg hover:bg-black hover:scale-102 transition-all duration-300"
            >
              <Link href="/login">ورود</Link>
            </Button>
          )}
        </div>
      </div>
    </LiquidHeader>
  );
}
