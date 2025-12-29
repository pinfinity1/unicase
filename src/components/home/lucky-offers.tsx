// src/components/home/lucky-offers.tsx
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";
import { TicketPercent } from "lucide-react";

// تابع تبدیل اعداد انگلیسی به فارسی
const toPersianDigits = (num: number | string) => {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num
    .toString()
    .replace(/\d/g, (x) => farsiDigits[parseInt(x)])
    .replace(/,/g, "،"); // تبدیل ویرگول به جداکننده فارسی (اختیاری)
};

export async function LuckyOffers() {
  const rawProducts = await db.product.findMany({
    where: {
      isAvailable: true,
      discountPrice: { not: null },
    },
    take: 4,
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  if (rawProducts.length < 4) return null;

  const products = rawProducts.map(serializeProduct);

  // محاسبه درصد تخفیف (برداشت از اولین محصول)
  const firstProduct = products[0];
  const discountPercentage = Math.round(
    ((firstProduct.price - firstProduct.discountPrice!) / firstProduct.price) *
      100
  );

  return (
    <section className="container mx-auto px-4 my-16">
      {/* هدر بسیار ساده و مینیمال */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          فروش ویژه امروز
        </h2>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 text-red-600">
          <TicketPercent className="h-4 w-4" />
          <span className="text-sm font-bold pt-1">
            {toPersianDigits(discountPercentage)}٪ تخفیف
          </span>
        </div>
      </div>

      {/* گرید محصولات - بدون انیمیشن اضافه */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <div key={product.id} className="group relative">
            <Link href={`/products/${product.slug}`} className="block">
              {/* بدنه کارت: ساده و تمیز */}
              <div className="relative w-full overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg hover:border-gray-300">
                {/* بخش تصویر: ثابت و بزرگ */}
                <div className="relative aspect-[4/5] w-full bg-white p-4">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain" // عکس کامل نمایش داده شود
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-50 text-gray-300">
                      بدون تصویر
                    </div>
                  )}
                </div>

                {/* بخش اطلاعات: اعداد فارسی */}
                <div className="p-4 pt-2 text-center space-y-2">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-center gap-2">
                    {/* قیمت اصلی (خط خورده) */}
                    <span className="text-xs text-gray-400 line-through decoration-gray-300">
                      {toPersianDigits(formatPrice(product.price))}
                    </span>

                    {/* قیمت نهایی (بولد) */}
                    <div className="flex items-center gap-1 text-gray-900">
                      <span className="text-lg font-black font-sans">
                        {toPersianDigits(formatPrice(product.discountPrice!))}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
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
