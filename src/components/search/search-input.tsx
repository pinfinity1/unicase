"use client";

import * as React from "react";
import { Search, Loader2, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  onClear: () => void;
  onClose: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  onClose,
  onKeyDown,
  isLoading,
  inputRef,
}: SearchInputProps) {
  return (
    <div className="relative flex items-center px-3 py-3 sm:px-4 sm:py-4 border-b border-gray-100 gap-2 sm:gap-3">
      {/* دکمه بستن در موبایل (سمت راست) */}
      <button
        onClick={onClose}
        className="sm:hidden p-2 text-gray-500 hover:text-gray-900"
      >
        <ChevronRight className="h-5 w-5 rtl:rotate-180" />
      </button>

      <div className="relative flex-1 flex items-center">
        <Search className="absolute right-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 z-10" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="جستجو..."
          // text-base جلوگیری از زوم در آیفون
          className="w-full h-10 sm:h-12 rounded-xl border-none bg-gray-100 pr-9 sm:pr-10 pl-4 text-base font-medium text-gray-900 placeholder:text-gray-500 focus-visible:ring-0 focus-visible:bg-gray-50 transition-all shadow-inner"
        />
      </div>

      {isLoading ? (
        <div className="h-10 w-10 flex items-center justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      ) : (
        // دکمه بستن/پاک کردن دسکتاپ
        <button
          onClick={() => {
            if (value) onClear();
            else onClose();
          }}
          className="hidden sm:flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      )}

      {/* دکمه پاک کردن متن در موبایل */}
      {value && !isLoading && (
        <button onClick={onClear} className="sm:hidden p-2 text-gray-500">
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
