import { GenerateFeaturedButton } from "@/components/admin/products/generate-featured-button";
import { GenerateLuckyButton } from "@/components/admin/products/generate-lucky-button";
import { ProductFormWrapper } from "@/components/admin/products/product-form-wrapper";
import { ProductList } from "@/components/admin/products/product-list";
import { db } from "@/lib/db";

export default async function ProductsPage() {
  const categories = await db.category.findMany({
    orderBy: { createdAt: "desc" },
  });

  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">مدیریت محصولات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            لیست تمام محصولات فروشگاه و مدیریت موجودی
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <GenerateLuckyButton />

          <GenerateFeaturedButton />

          <ProductFormWrapper categories={categories} brands={brands} />
        </div>
      </div>

      <ProductList />
    </div>
  );
}
