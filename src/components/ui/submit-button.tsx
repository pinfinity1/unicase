// src/components/ui/submit-button.tsx
"use client";

import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils"; // اگر lib/utils ندارید، این خط را حذف و کلاس‌ها را دستی بنویسید

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  loadingText?: string;
}

export function SubmitButton({
  text = "ذخیره تغییرات",
  loadingText = "در حال پردازش...",
  className,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "relative w-full overflow-hidden rounded-xl py-3 px-4 font-semibold text-white transition-all duration-300",
        "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 shadow-lg hover:shadow-blue-500/30",
        "disabled:opacity-70 disabled:cursor-not-allowed disabled:grayscale",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {pending && (
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        <span>{pending ? loadingText : text}</span>
      </div>

      {/* افکت براق شیشه‌ای (Liquid Glass Accent) */}
      <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </button>
  );
}
