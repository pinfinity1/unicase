// src/app/(shop)/page.tsx
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Imports from Lib & DB
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";

// Imports from Components
import { ProductCard } from "@/components/product/product-card";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { CategoryRail } from "@/components/home/category-rail"; // جدید
import { PromoBento } from "@/components/home/promo-bento"; // جدید
import { SeoBox } from "@/components/home/seo-box"; // جدید

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const rawProducts = await db.product.findMany({
    where: { isAvailable: true, isArchived: false },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: { category: true },
  });

  const products = rawProducts.map(serializeProduct);

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      <Hero />

      <CategoryRail />

      <main className="container mx-auto px-4">
        {/* 3. لیست محصولات (پرفروش‌ترین‌ها) */}
        <section className="mb-24 mt-10">
          <div className="mb-8 flex items-end justify-between px-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-gray-900">
                منتخب کاربران
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                محصولاتی که بیشترین طرفدار را دارند
              </p>
            </div>
            <Link
              href="/products"
              className="group flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
            >
              مشاهده همه
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        <Features />
      </main>

      <SeoBox />
    </div>
  );
}
