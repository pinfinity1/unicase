import { Suspense } from "react";
import { Hero } from "@/components/home/hero";
import { LuckyOffers } from "@/components/home/lucky-offers";
import { Bestsellers } from "@/components/home/bestsellers";
import { Features } from "@/components/home/features";
import { SeoBox } from "@/components/home/seo-box";
import { Skeleton } from "@/components/ui/skeleton";

export const revalidate = 60;

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      <Hero />

      <div className="relative z-10 space-y-20 pb-20 pt-10">
        <main className="container mx-auto px-4 space-y-32">
          <Suspense
            fallback={<Skeleton className="h-[400px] w-full rounded-3xl" />}
          >
            <LuckyOffers />
          </Suspense>

          {/* ۳. پرفروش‌ترین‌ها */}
          <Suspense
            fallback={<Skeleton className="h-[400px] w-full rounded-3xl" />}
          >
            <Bestsellers />
          </Suspense>

          <Features />
        </main>

        <SeoBox />
      </div>
    </div>
  );
}
