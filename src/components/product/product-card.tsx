import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    image: string | null;
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat("fa-IR").format(product.price);
  const isOutOfStock = product.stock <= 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group flex flex-col gap-4 transition-opacity",
        isOutOfStock && "opacity-75 grayscale-[0.5]" // اگر ناموجود بود کمی کمرنگ شود
      )}
    >
      {/* ۱. قاب تصویر (Apple Style)
         - رنگ پس‌زمینه #F5F5F7 (خاکستری روشن معروف اپل)
         - گردی زیاد (rounded-3xl)
         - بدون بوردر، بدون سایه شدید
      */}
      <div className="relative aspect-square w-full overflow-hidden rounded-[32px] bg-[#F5F5F7] p-6 flex items-center justify-center">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            // حذف scale و افکت‌های اضافی طبق دستور شما
            className="object-contain p-4 mix-blend-multiply"
            // mix-blend-multiply باعث می‌شود پس‌زمینه سفید عکس (اگر داشته باشد) با خاکستری زمینه ترکیب شود
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300 text-sm">
            بدون تصویر
          </div>
        )}

        {/* بج ناموجود (مینیمال) */}
        {isOutOfStock && (
          <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-gray-500 shadow-sm">
            ناموجود
          </div>
        )}
      </div>

      {/* ۲. بخش اطلاعات (زیر عکس)
         - بسیار ساده و خوانا
         - بدون دکمه اضافه
      */}
      <div className="flex flex-col items-start px-2 space-y-1.5">
        {/* نام محصول (حداکثر ۲ خط) */}
        <h3 className="font-bold text-base text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* قیمت (فونت مونو برای خوانایی اعداد) */}
        <div className="flex items-center gap-1.5">
          {isOutOfStock ? (
            <span className="text-sm font-medium text-gray-400">
              فعلاً موجود نیست
            </span>
          ) : (
            <>
              <span className="text-lg font-semibold text-gray-900 font-mono tracking-tight">
                {formattedPrice}
              </span>
              <span className="text-[11px] font-medium text-gray-500 mt-1">
                تومان
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
