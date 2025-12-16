import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";
import { ProductCard } from "@/components/product/product-card";
import { SearchX } from "lucide-react";
import { redirect } from "next/navigation";

interface SearchPageProps {
  searchParams: Promise<{ q: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams; // در Next 15 پارامترها پرامیس هستند

  if (!q) {
    redirect("/");
  }

  const products = await db.product.findMany({
    where: {
      AND: [
        { isAvailable: true },
        { isArchived: false },
        {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  const serializedProducts = products.map(serializeProduct);

  return (
    <div className="container mx-auto px-4 py-24 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          نتایج جستجو برای: <span className="text-primary">"{q}"</span>
        </h1>
        <p className="text-gray-500 text-sm mt-2">
          {products.length} محصول پیدا شد.
        </p>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {serializedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[32px] border border-gray-100">
          <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <SearchX className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            متاسفانه نتیجه‌ای یافت نشد
          </h2>
          <p className="text-gray-500 mt-2">
            لطفاً املای کلمات را بررسی کنید یا کلمات کلیدی دیگری را امتحان کنید.
          </p>
        </div>
      )}
    </div>
  );
}
