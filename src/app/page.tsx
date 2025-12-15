// src/app/page.tsx
import { db } from "@/lib/db";
import { ProductCard } from "@/components/shop/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function HomePage() {
  // 1. دریافت دیتای خام از دیتابیس
  const rawProducts = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  // 2. ✅ تبدیل Decimal به Number (این بخش کلیدی است)
  // ما یک آرایه جدید می‌سازیم که در آن قیمت‌ها عدد شده‌اند
  const products = rawProducts.map((product) => ({
    ...product,
    price: product.price.toNumber(),
    // اگر discountPrice هم دارید و null نیست، آن را هم تبدیل کنید:
    discountPrice: product.discountPrice
      ? product.discountPrice.toNumber()
      : null,
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* هدر ساده */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-black text-primary font-lalezar">
            UniCase
          </h1>
          <div className="flex gap-4">
            <Button variant="ghost" asChild>
              <Link href="/admin">پنل مدیریت</Link>
            </Button>
            <Button asChild>
              <Link href="/login">ورود / ثبت‌نام</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* بنر */}
      <section className="bg-primary text-primary-foreground py-16 px-4 mb-12">
        <div className="container mx-auto text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-lalezar">
            قاب گوشی، به سبک تو
          </h2>
          <p className="text-lg opacity-90 max-w-2xl mx-auto">
            جدیدترین و خاص‌ترین قاب‌های گوشی را با بهترین کیفیت از یونی‌کیس
            بخواهید.
          </p>
        </div>
      </section>

      {/* لیست محصولات */}
      <main className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-gray-800 border-r-4 border-primary pr-3">
            جدیدترین محصولات
          </h3>
          <Link
            href="/products"
            className="flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            مشاهده همه
            <ArrowLeft className="mr-1 h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
            <p className="text-gray-500 text-lg">
              هنوز محصولی اضافه نشده است 😔
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/admin/products">افزودن محصول (مدیر)</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              // 3. حالا products حاوی اعداد ساده است و ارور نمی‌دهد
              <ProductCard key={product.id} product={product as any} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
