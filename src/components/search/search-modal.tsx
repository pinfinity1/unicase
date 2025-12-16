"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { searchProducts, getLuckySuggestions } from "@/actions/search";
import { ProductClient } from "@/types";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

import { SearchInput } from "./search-input";
import { SearchSuggestions } from "./search-suggestions";
import { SearchResults } from "./search-results";
import { SearchEmpty } from "./search-empty";

interface SearchModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function SearchModal({ open, setOpen }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<ProductClient[]>([]);
  const [suggestions, setSuggestions] = React.useState<ProductClient[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 300);

  React.useEffect(() => {
    if (open && suggestions.length === 0) {
      getLuckySuggestions().then(setSuggestions);
    }
  }, [open, suggestions.length]);

  React.useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    searchProducts(debouncedQuery).then((data) => {
      setResults(data);
      setIsLoading(false);
    });
  }, [debouncedQuery]);

  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setQuery("");
        setResults([]);
        setIsLoading(false);
      }, 200);
    } else {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleViewAll = () => {
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden border-none shadow-2xl bg-white",
          "[&>button]:hidden", // حذف ضربدر دیفالت
          // 👇 استایل‌های ریسپانسیو و فیکس پوزیشن
          "w-[95vw] max-w-lg rounded-2xl md:rounded-3xl", // عرض ۹۵٪ در موبایل، ۵۱۲px در دسکتاپ
          "fixed !top-[5%] !translate-y-0 sm:!top-[15%]", // چسبیدن به بالا برای جلوگیری از تداخل با کیبورد موبایل
          "max-h-[85vh] flex flex-col" // محدودیت ارتفاع
        )}
      >
        <DialogTitle className="sr-only">جستجو</DialogTitle>

        {/* هدر ثابت */}
        <div className="flex-none">
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={() => setQuery("")}
            onClose={() => setOpen(false)}
            onKeyDown={handleKeyDown}
            isLoading={isLoading}
            inputRef={inputRef}
          />
        </div>

        {/* بدنه اسکرول‌خور */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {!query ? (
            <SearchSuggestions
              suggestions={suggestions}
              onSelect={() => setOpen(false)}
            />
          ) : results.length > 0 ? (
            <SearchResults
              results={results}
              query={query}
              onSelect={() => setOpen(false)}
              onViewAll={handleViewAll}
            />
          ) : !isLoading ? (
            <SearchEmpty />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
