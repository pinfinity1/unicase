"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { AdminSidebar } from "./sidebar";
import { useState } from "react";

export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-16 items-center justify-between border-b bg-white px-4 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 hover:bg-zinc-100"
          >
            <Menu className="h-6 w-6 text-zinc-700" />
            <span className="sr-only">باز کردن منو</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="p-0 w-72 border-l-0 [&>button]:left-4 [&>button]:right-auto [&>button]:top-4 bg-white"
        >
          <SheetTitle className="sr-only">منوی مدیریت</SheetTitle>
          <SheetDescription className="sr-only">
            دسترسی به بخش‌های مختلف پنل
          </SheetDescription>

          {/* محتوای سایدبار */}
          <div className="h-full">
            <AdminSidebar onLinkClick={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2 font-bold text-lg text-foreground">
        <span>UniCase</span>
      </div>
    </div>
  );
}
