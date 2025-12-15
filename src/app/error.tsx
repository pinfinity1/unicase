"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="rounded-full bg-red-50 p-8 shadow-sm border border-red-100">
        <AlertTriangle className="h-16 w-16 text-red-500" />
      </div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight font-sans text-gray-900">
          مشکلی پیش آمده است!
        </h2>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          یک خطای غیرمنتظره رخ داده است. تیم فنی ما از این موضوع آگاه شده است.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button onClick={reset} size="lg" className="gap-2 min-w-35">
          <RotateCcw className="h-4 w-4" />
          تلاش مجدد
        </Button>

        <Button
          onClick={() => (window.location.href = "/")}
          variant="outline"
          size="lg"
          className="gap-2 min-w-35"
        >
          <Home className="h-4 w-4" />
          صفحه اصلی
        </Button>
      </div>
    </div>
  );
}
