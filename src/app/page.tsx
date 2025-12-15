// src/app/page.tsx
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
// 👇 کامپوننت جدید را ایمپورت کنید
import { CartCounter } from "@/components/cart/cart-counter";

export default async function HomePage() {
  const rawProducts = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const products = rawProducts.map((product) => ({
    ...product,
    price: product.price.toNumber(),
    discountPrice: product.discountPrice
      ? product.discountPrice.toNumber()
      : null,
  }));

  // ❌ خطی که ارور می‌داد (useStore) را از اینجا پاک کنید

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-black text-primary font-sans">
            UniCase
          </h1>
          <div className="flex gap-2 items-center">
            {/* 👇 دکمه سبد خرید را اینجا اضافه کنید */}
            <CartCounter />

            <Button variant="ghost" asChild>
              <Link href="/admin">پنل مدیریت</Link>
            </Button>
            <Button asChild>
              <Link href="/login">ورود / ثبت‌نام</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ادامه کدها بدون تغییر... */}
      <section className="bg-primary text-primary-foreground py-16 px-4 mb-12">
        {/* ... */}
      </section>

      <main className="container mx-auto px-4">
        {/* ... */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product as any} />
          ))}
        </div>
      </main>
    </div>
  );
}
