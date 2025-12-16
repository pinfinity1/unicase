// src/app/(shop)/page.tsx

// Imports from Lib & DB
import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";

// Imports from Components
import { ProductCard } from "@/components/product/product-card";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { CategoryRail } from "@/components/home/category-rail"; // جدید
import { SeoBox } from "@/components/home/seo-box"; // جدید
import { LuckyOffers } from "@/components/home/lucky-offers";
import { Bestsellers } from "@/components/home/bestsellers";

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
    <div className="min-h-screen">
      <Hero />

      <CategoryRail />

      <main className="container mx-auto px-4">
        <LuckyOffers />
        <Bestsellers />
        <Features />
      </main>

      <SeoBox />
    </div>
  );
}
