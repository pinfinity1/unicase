// src/app/products/[slug]/page.tsx
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { Badge } from "@/components/ui/badge";
import { AddToCartButton } from "@/components/product/add-to-cart-btn";
import { ShieldCheck, Truck } from "lucide-react";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const { slug } = params;

  const decodedSlug = decodeURIComponent(slug);

  const product = await db.product.findUnique({
    where: { slug: decodedSlug },
    include: { category: true },
  });

  if (!product) {
    return notFound();
  }

  // مدیریت تصاویر برای نمایش در گالری
  const displayImages =
    product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  // فرمت قیمت برای نمایش در همین صفحه (سرور ساید)
  const formattedPrice = new Intl.NumberFormat("fa-IR").format(
    product.price.toNumber()
  );

  // این کار لازم است چون Decimal مستقیماً به کلاینت پاس داده نمی‌شود
  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price.toNumber(), // تبدیل مهم
    image: displayImages[0] || null, // استفاده از اولین تصویر گالری به عنوان تصویر اصلی
    stock: product.stock,
  };

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:gap-16">
        {/* ستون راست: گالری تصاویر */}
        <div>
          <ProductGallery images={displayImages} />
        </div>

        {/* ستون چپ: اطلاعات محصول */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs font-normal">
                {product.category.name}
              </Badge>
              {product.stock > 0 ? (
                <Badge
                  variant="outline"
                  className="border-green-200 text-green-700 bg-green-50"
                >
                  موجود در انبار
                </Badge>
              ) : (
                <Badge variant="destructive">ناموجود</Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl font-sans">
              {product.name}
            </h1>
          </div>

          <div className="border-t border-b py-6 space-y-4">
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-primary">
                {formattedPrice}
              </span>
              <span className="mb-1 text-gray-500">تومان</span>
            </div>

            <p className="text-gray-600 leading-relaxed text-justify">
              {product.description ||
                "توضیحات تکمیلی برای این محصول ثبت نشده است."}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            {/* 👇 جایگزینی دکمه قدیمی با دکمه جدید هوشمند [cite: 8] */}
            <AddToCartButton product={productData} />
          </div>

          {/* مزایا */}
          <div className="grid grid-cols-2 gap-4 pt-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span>ضمانت اصالت کالا</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>ارسال سریع به سراسر کشور</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
