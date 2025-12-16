"use client";

import { Search } from "lucide-react";

export function SearchEmpty() {
  return (
    <div className="py-16 text-center text-sm text-gray-400 flex flex-col items-center">
      <div className="bg-gray-50 p-4 rounded-full mb-3">
        <Search className="h-6 w-6 text-gray-300" />
      </div>
      <p>محصولی یافت نشد.</p>
    </div>
  );
}
