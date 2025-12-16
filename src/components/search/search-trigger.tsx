"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { SearchModal } from "./search-modal";

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
      {/* 🖥️ دکمه دسکتاپ: کپسول شیشه‌ای (Glass Pill) */}
      <button
        onClick={() => setOpenSearch(true)}
        className="
          hidden md:flex items-center gap-3 
          mx-2 w-64 lg:w-72 h-10 px-4 rounded-full
          
          /* استایل شیشه‌ای مات */
          bg-white/40 hover:bg-white/60
          border border-white/50
          backdrop-blur-md
          shadow-sm hover:shadow-md
          
          text-sm text-gray-600 hover:text-gray-900
          transition-all duration-300
          group
        "
      >
        <Search className="h-4 w-4 text-gray-500 group-hover:text-gray-800 transition-colors" />

        <span className="flex-1 text-right font-medium opacity-80">
          جستجو...
        </span>

        {/* شورتکات کیبورد */}
        <div
          className="
          hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md 
          bg-white/50 border border-white/60 
          text-[10px] font-bold text-gray-500 font-mono
        "
        >
          <span className="text-xs">⌘</span>K
        </div>
      </button>

      {/* 📱 دکمه موبایل: دایره مات (هماهنگ با سبد خرید) */}
      <button
        onClick={() => setOpenSearch(true)}
        className="
          md:hidden
          flex h-10 w-10 items-center justify-center rounded-full 
          bg-white/40 hover:bg-white/60
          border border-white/50
          shadow-sm active:scale-95
          backdrop-blur-md
          transition-all duration-300
          mr-2
        "
      >
        <Search className="h-5 w-5 text-gray-800" strokeWidth={2} />
      </button>

      {/* مودال جستجو */}
      <SearchModal open={openSearch} setOpen={setOpenSearch} />
    </>
  );
}
