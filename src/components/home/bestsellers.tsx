// src/components/home/bestsellers.tsx
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Star } from "lucide-react";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const toPersianDigits = (num: number | string) => {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)])
    .replace(/,/g, "،");
};

export async function Bestsellers() {
  const rawProducts = await db.product.findMany({
    where: { isAvailable: true, isFeatured: true },
    take: 8,
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  if (rawProducts.length === 0) return null;
  const products = rawProducts.map(serializeProduct);

  return (
    <section className="container mx-auto px-4 mb-16 md:mb-24">
      {/* هدر */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 md:h-8 md:w-8 items-center justify-center rounded-full bg-yellow-50 text-yellow-600">
            <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-current" />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
            محبوب‌ترین‌ها
          </h2>
        </div>
        <Link
          href="/products"
          className="flex items-center gap-1 text-xs md:text-sm font-bold text-blue-600"
        >
          همه
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
        </Link>
      </div>

      <Carousel
        opts={{ align: "start", direction: "rtl", dragFree: true }}
        className="w-full dir-rtl"
      >
        <CarouselContent className="-ml-3 pb-4">
          {products.map((product) => (
            // 📱 Mobile: basis-[40%] (یعنی ۲.۵ آیتم در صفحه دیده می‌شود -> تشویق به اسکرول)
            // 💻 Desktop: basis-[20%] (۵ آیتم)
            <CarouselItem
              key={product.id}
              className="pl-3 basis-[40%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%]"
            >
              <Link
                href={`/products/${product.slug}`}
                className="group block h-full"
              >
                <div className="flex flex-col gap-2">
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#F9F9F9] border border-transparent group-hover:border-gray-200 transition-colors">
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-3 mix-blend-multiply"
                        sizes="(max-width: 768px) 40vw, 20vw"
                      />
                    ) : null}
                  </div>
                  <div className="space-y-1 pr-1">
                    <h3 className="text-xs font-bold text-gray-900 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-900">
                      <span className="text-sm md:text-base font-black font-sans">
                        {toPersianDigits(formatPrice(product.price))}
                      </span>
                      <span className="text-[9px] text-gray-500">تومان</span>
                    </div>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
