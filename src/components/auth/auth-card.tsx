// src/components/auth/auth-card.tsx
import { cn } from "@/lib/utils";

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-white px-6 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-3xl border border-gray-100 sm:px-10",
        className
      )}
    >
      {children}
    </div>
  );
}
