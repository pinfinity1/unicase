import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export async function Bestsellers() {
  // دریافت محصولات ویژه (Featured)
  const rawProducts = await db.product.findMany({
    where: {
      isAvailable: true,
      isArchived: false,
      isFeatured: true,
    },
    take: 10, // تعداد را ۱۰ تا کردیم چون در اسلایدر جا هست
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  if (rawProducts.length === 0) return null;

  const products = rawProducts.map(serializeProduct);

  return (
    <section className="mb-24 px-4 container mx-auto">
      {" "}
      {/* کانتینر برای وسط‌چین شدن */}
      {/* هدر بخش (تیتر و دکمه‌ها) */}
      <div className="mb-8 flex items-end justify-between px-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100">
              <Star className="h-4 w-4 text-yellow-600 fill-yellow-600" />
            </div>
            <h2 className="text-3xl font-black tracking-tight text-gray-900">
              محبوب‌ترین‌ها
            </h2>
          </div>
          <p className="text-sm text-gray-500 mr-10 hidden sm:block">
            انتخاب شده توسط تیم تحریریه یونی‌کیس
          </p>
        </div>

        <Link
          href="/products"
          className="group flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap"
        >
          مشاهده همه
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
      {/* اسلایدر محصولات */}
      <Carousel
        opts={{
          align: "start", // آیتم‌ها از ابتدای سمت راست شروع شوند
          direction: "rtl", // جهت اسکرول راست‌چین
        }}
        className="w-full dir-rtl" // کلاس کمکی برای جهت
      >
        <CarouselContent className="-ml-4 pb-4">
          {" "}
          {/* pb-4 برای اینکه سایه هاور کارت‌ها بریده نشود */}
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              {/* توضیح سایزها (basis):
                  - موبایل (basis-[85%]): یک آیتم کامل + کمی از آیتم بعدی (UX بهتر)
                  - تبلت (basis-1/2): دو آیتم
                  - لپتاپ (basis-1/3): سه آیتم
                  - دسکتاپ (basis-1/4): چهار آیتم
                  - مانیتور بزرگ (basis-1/5): پنج آیتم
               */}
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* دکمه‌های نویگیشن (چپ و راست) */}
        {/* hidden md:flex یعنی در موبایل دکمه نباشد (با دست اسکرول کنند) */}
        <div className="hidden md:block">
          <CarouselPrevious className="left-0 -translate-x-1/2 bg-white/80 backdrop-blur border-gray-200 hover:bg-white text-gray-800" />
          <CarouselNext className="right-0 translate-x-1/2 bg-white/80 backdrop-blur border-gray-200 hover:bg-white text-gray-800" />
        </div>
      </Carousel>
    </section>
  );
}
