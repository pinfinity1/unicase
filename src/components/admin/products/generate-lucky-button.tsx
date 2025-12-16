"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { generateLuckyDeals } from "@/actions/marketing";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function GenerateLuckyButton() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [percent, setPercent] = useState(10); // پیش‌فرض ۱۰ درصد
  const router = useRouter();

  const handleGenerate = async () => {
    if (percent < 1 || percent > 90) {
      toast.error("درصد تخفیف باید بین ۱ تا ۹۰ باشد");
      return;
    }

    setLoading(true);
    try {
      const result = await generateLuckyDeals(percent); // 👈 ارسال درصد به سرور

      if (result.success) {
        toast.success(result.message);
        router.refresh();
        setOpen(false); // بستن دیالوگ
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("خطای غیرمنتظره رخ داد");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-500/20">
          <Sparkles className="mr-2 h-4 w-4" />
          پیشنهاد شگفت‌انگیز
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>تنظیمات شانس امروز</DialogTitle>
          <DialogDescription>
            ۴ محصول به صورت تصادفی انتخاب می‌شوند. درصد تخفیف را مشخص کنید.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="percent" className="text-right">
              درصد تخفیف:{" "}
              <span className="text-violet-600 font-bold text-lg">
                {percent}٪
              </span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="percent"
                type="number"
                min="1"
                max="90"
                value={percent}
                onChange={(e) => setPercent(Number(e.target.value))}
                className="col-span-3 text-center text-lg font-bold"
              />
              <span className="text-gray-500">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              مثال: اگر قیمت ۱۰۰ هزار تومان باشد و ۱۰٪ بزنید، قیمت ۹۰ هزار تومان
              می‌شود.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-700"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                در حال قرعه‌کشی...
              </>
            ) : (
              "شروع قرعه‌کشی و اعمال تخفیف"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
