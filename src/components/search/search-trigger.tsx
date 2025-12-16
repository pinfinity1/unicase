"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchModal } from "./search-modal";
import { Kbd } from "../ui/kbd";

export function SearchTrigger() {
  const [openSearch, setOpenSearch] = useState(false);

  // شورتکات Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenSearch((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      {/* دکمه دسکتاپ (شبیه اینپوت) */}
      <button
        onClick={() => setOpenSearch(true)}
        className="flex-1 mx-4 max-w-sm hidden md:flex items-center gap-2 rounded-full border border-gray-200/50 bg-gray-50/50 px-4 py-2 text-sm text-gray-400 transition-colors hover:bg-white hover:border-gray-300"
      >
        <Search className="h-4 w-4" />
        <span>جستجو در محصولات...</span>
        <Kbd className="mr-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
          <span className="text-xs">⌘</span>K
        </Kbd>
      </button>

      {/* دکمه موبایل (فقط آیکون) */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden rounded-full text-gray-500"
        onClick={() => setOpenSearch(true)}
      >
        <Search className="h-5 w-5" />
      </Button>

      {/* مودال جستجو */}
      <SearchModal open={openSearch} setOpen={setOpenSearch} />
    </>
  );
}
