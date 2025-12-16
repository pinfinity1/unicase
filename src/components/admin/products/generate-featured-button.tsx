"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { generateFeaturedProducts } from "@/actions/marketing"; // 👈 تابع جدید
import { useRouter } from "next/navigation";

export function GenerateFeaturedButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateFeaturedProducts();

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("خطای غیرمنتظره");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={loading}
      variant="outline"
      className="border-yellow-500 text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 bg-white"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Star className="mr-2 h-4 w-4 fill-yellow-500/20" />
      )}
      بروزرسانی محبوب‌ها
    </Button>
  );
}
