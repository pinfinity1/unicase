// components/profile/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, MapPin, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "اطلاعات حساب", href: "/profile", icon: User },
  { name: "سفارش‌های من", href: "/profile/orders", icon: ShoppingBag },
  { name: "آدرس‌ها", href: "/profile/addresses", icon: MapPin },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 ">
      {menuItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-3 px-6 py-4 transition-all duration-300 rounded-2xl",
            pathname === item.href
              ? "bg-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
              : "text-black/60 hover:bg-white/5"
          )}
        >
          <item.icon className="h-5 w-5" />
          <span className="font-medium">{item.name}</span>
        </Link>
      ))}
      <button className="flex items-center gap-3 px-6 py-4 text-red-400 hover:bg-red-500/10 transition-colors rounded-2xl mt-4">
        <LogOut className="h-5 w-5" />
        <span>خروج</span>
      </button>
    </nav>
  );
}
