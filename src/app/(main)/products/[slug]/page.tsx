import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/product/product-gallery";
import { ShieldCheck, Check, AlertCircle } from "lucide-react";
import { getCart } from "@/lib/cart";
import { ProductActionWrapper } from "@/components/product/product-action-wrapper";
import { ProductJsonLd } from "@/components/seo/product-json-ld";
import { serializeProduct } from "@/lib/utils";
import { Metadata } from "next";
import { cache } from "react"; // 👈 برای جلوگیری از درخواست تکراری به دیتابیس

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// ۱. تابع کش‌شده برای واکشی محصول (پرفورمنس بالا)
const getProduct = cache(async (slug: string) => {
  const product = await db.product.findUnique({
    where: { slug },
    include: {
      category: true,
      variants: true, // 👈 حیاتی: اضافه شدن واریانت‌ها برای انتخاب رنگ
      brand: true, // برای سئو و نمایش برند
    },
  });
  return product;
});

export async function generateMetadata(
  props: ProductPageProps
): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(decodeURIComponent(params.slug));

  if (!product) return { title: "محصول یافت نشد" };

  return {
    title: product.name,
    description: product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      images: [{ url: product.image || "/logo.png" }],
      locale: "fa_IR",
      type: "website",
    },
  };
}

export default async function ProductPage(props: ProductPageProps) {
  const params = await props.params;
  const rawProduct = await getProduct(decodeURIComponent(params.slug));

  if (!rawProduct) return notFound();

  const product = serializeProduct(rawProduct);
  const cart = await getCart();

  // پیدا کردن تعداد در سبد خرید (بدون در نظر گرفتن واریانت در مقدار اولیه، چون در کلاینت هندل می‌شود)
  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const initialQty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="min-h-screen">
      <ProductJsonLd product={product} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-[40px] p-6 lg:p-10 shadow-sm border border-gray-100">
          <div>
            <ProductGallery images={product.images} />
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <header>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                  {product.category.name}
                </span>

                {/* نمایش موجودی کل یا وضعیت موجودی */}
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-xs font-medium text-green-600">
                    <Check className="h-3 w-3" /> موجود در انبار
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-50 text-xs font-medium text-red-600">
                    <AlertCircle className="h-3 w-3" /> ناموجود
                  </span>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-4">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-gray-500 leading-8 text-lg">
                  {product.description}
                </p>
              )}
            </header>

            <div className="border-t border-gray-100 pt-8">
              {/* بخش قیمت و دکمه خرید */}
              <div className="flex flex-col gap-6">
                <ProductActionWrapper
                  productId={product.id}
                  basePrice={Number(product.price)}
                  discountPrice={
                    product.discountPrice ? Number(product.discountPrice) : null
                  }
                  stock={product.stock}
                  variants={product.variants} // 👈 ارسال لیست واریانت‌ها به کلاینت
                  initialQuantity={initialQty}
                />

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 bg-gray-50 py-3 rounded-xl">
                  <ShieldCheck className="h-4 w-4" />
                  <span>۷ روز ضمانت بازگشت کالا + ضمانت اصالت UniCase</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
