import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 text-center px-4">
      <div className="rounded-full bg-gray-50 p-8 shadow-sm">
        <FileQuestion className="h-16 w-16 text-gray-400" />
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight font-lalezar text-gray-900">
          صفحه مورد نظر پیدا نشد
        </h2>
        <p className="text-gray-500 text-lg">
          متاسفانه صفحه‌ای که دنبال آن بودید وجود ندارد یا حذف شده است.
        </p>
      </div>

      <Button asChild size="lg" className="mt-4 min-w-[160px]">
        <Link href="/">بازگشت به خانه</Link>
      </Button>
    </div>
  );
}
