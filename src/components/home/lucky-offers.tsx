// src/components/home/lucky-offers.tsx
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { TicketPercent } from "lucide-react";

const toPersianDigits = (num: number | string) => {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)])
    .replace(/,/g, "،");
};

export async function LuckyOffers() {
  const rawProducts = await db.product.findMany({
    where: { isAvailable: true, discountPrice: { not: null } },
    take: 4,
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  if (rawProducts.length < 4) return null;
  const products = rawProducts.map(serializeProduct);
  const firstProduct = products[0];
  const discountPercentage = Math.round(
    ((firstProduct.price - firstProduct.discountPrice!) / firstProduct.price) *
      100
  );

  return (
    <section className="container mx-auto px-4 my-8 md:my-16">
      {/* هدر: فشرده‌تر در موبایل */}
      <div className="flex flex-row items-center justify-between mb-6 border-b border-gray-100 pb-4">
        <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">
          شانس امروز
        </h2>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
          <TicketPercent className="h-3.5 w-3.5" />
          <span className="text-xs md:text-sm font-bold pt-0.5">
            {toPersianDigits(discountPercentage)}٪ تخفیف
          </span>
        </div>
      </div>

      {/* 📱 Mobile: grid-cols-2 (دو ستونه برای صرفه‌جویی در ارتفاع)
          💻 Desktop: grid-cols-4 (چهار ستونه)
       */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-6">
        {products.map((product) => (
          <div key={product.id} className="relative">
            <Link href={`/products/${product.slug}`} className="block h-full">
              <div className="relative h-full w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
                {/* تصویر: در موبایل ارتفاع کمتر */}
                <div className="relative aspect-[3/4] w-full bg-white p-2 md:p-4">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-50 text-xs text-gray-300">
                      تصویر ندارد
                    </div>
                  )}
                </div>

                {/* اطلاعات: پدینگ کمتر در موبایل */}
                <div className="p-3 text-center space-y-1.5 border-t border-gray-50">
                  <h3 className="text-xs md:text-sm font-bold text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>

                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span className="text-[10px] text-gray-400 line-through decoration-gray-300">
                      {toPersianDigits(formatPrice(product.price))}
                    </span>
                    <div className="flex items-center gap-1 text-gray-900">
                      <span className="text-base md:text-lg font-black font-sans">
                        {toPersianDigits(formatPrice(product.discountPrice!))}
                      </span>
                      <span className="text-[9px] md:text-[10px] text-gray-500 font-medium">
                        تومان
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
