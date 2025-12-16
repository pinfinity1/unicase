import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { ShieldCheck, Check, AlertCircle } from "lucide-react";
import { getCart } from "@/lib/cart";
import { ProductActionWrapper } from "@/components/product/product-action-wrapper";
import { ProductJsonLd } from "@/components/seo/product-json-ld"; // 👈 ایمپورت جدید
import { serializeProduct } from "@/lib/utils"; // 👈 برای تبدیل دسیال
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ۱. تولید متادیتای کامل برای سئو و سوشال مدیا
export async function generateMetadata(
  props: ProductPageProps
): Promise<Metadata> {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);

  const product = await db.product.findUnique({
    where: { slug },
  });

  if (!product) {
    return {
      title: "محصول یافت نشد",
    };
  }

  const images =
    product.images.length > 0 ? product.images : ["/logo/unicase-black.png"];

  return {
    title: product.name,
    description: product.description?.slice(0, 160), // توضیحات کوتاه برای گوگل
    openGraph: {
      title: product.name,
      description: product.description || "",
      images: [
        {
          url: images[0],
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
      type: "website",
      locale: "fa_IR",
      siteName: "UniCase",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      images: [images[0]],
    },
  };
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const slug = decodeURIComponent(params.slug);

  const rawProduct = await db.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!rawProduct) return notFound();

  // تبدیل دسیال به نامبر برای استفاده در کلاینت
  const product = serializeProduct(rawProduct);

  const cart = await getCart();
  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const initialQty = cartItem ? cartItem.quantity : 0;

  const formattedPrice = new Intl.NumberFormat("fa-IR").format(product.price);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ۲. تزریق اسکیما برای گوگل */}
      <ProductJsonLd product={product} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-[40px] p-6 lg:p-10 shadow-sm border border-white/60">
          {/* گالری تصاویر */}
          <div>
            <ProductGallery images={product.images} />
          </div>

          {/* اطلاعات محصول */}
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                  {product.category.name}
                </span>

                {product.stock > 0 ? (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-xs font-medium text-green-600">
                    <Check className="h-3 w-3" />
                    موجود در انبار
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    ناموجود
                  </span>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-gray-500 leading-8 text-lg">
                  {product.description}
                </p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-8">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-sm text-gray-400 mb-1">قیمت مصرف کننده</p>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl font-black text-gray-900 font-mono tracking-tight">
                      {formattedPrice}
                    </span>
                    <span className="text-gray-500 text-lg">تومان</span>
                  </div>
                </div>
              </div>

              {/* دکمه افزودن به سبد */}
              <div className="flex flex-col gap-4">
                <ProductActionWrapper
                  productId={product.id}
                  stock={product.stock}
                  initialQuantity={initialQty}
                />

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 py-3 rounded-xl">
                  <ShieldCheck className="h-4 w-4" />
                  <span>۷ روز ضمانت بازگشت کالا + ضمانت اصالت</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
