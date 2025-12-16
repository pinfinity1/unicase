import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { Sparkles, Clock } from "lucide-react";

export async function LuckyOffers() {
  const rawProducts = await db.product.findMany({
    where: {
      isAvailable: true,
      isArchived: false,
      discountPrice: { not: null },
    },
    take: 4,
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  if (rawProducts.length === 0) return null;

  const products = rawProducts.map(serializeProduct);

  return (
    <section className="relative mt-12 mb-24">
      {/* کانتینر اصلی: 
        به جای باکس رنگی، از یک بوردر خیلی محو و یک گرادینت عمودی 
        بسیار نامحسوس (از رنگ اصلی به سفید) استفاده می‌کنیم.
      */}
      <div className="mx-auto w-full max-w-screen-2xl rounded-[32px] border border-border/50 bg-gradient-to-b from-primary/5 via-transparent to-transparent p-6 sm:p-10">
        {/* هدر بخش: تمیز و مینیمال */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>پیشنهاد لحظه‌ای</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              شانسِ امروز
            </h2>
            <p className="text-muted-foreground max-w-md text-sm sm:text-base">
              محصولاتی که فقط برای مدت کوتاهی با این قیمت عرضه می‌شوند.
            </p>
          </div>

          {/* تایمر: استایل کپسولی و مدرن (Glassmorphism) */}
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/50 px-5 py-3 backdrop-blur-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <Clock className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                زمان باقی‌مانده
              </span>
              <span className="font-mono text-lg font-bold tabular-nums text-foreground tracking-widest">
                12:00:00
              </span>
            </div>
          </div>
        </div>

        {/* گرید محصولات */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            /* نکته: پراپ isLucky را پاس می‌دهیم تا شاید بخواهید 
               توی خود کارت یک بج کوچک "ویژه" نمایش دهید 
            */
            <ProductCard key={product.id} product={product} isLucky={true} />
          ))}
        </div>
      </div>
    </section>
  );
}
