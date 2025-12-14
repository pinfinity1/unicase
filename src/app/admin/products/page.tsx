import { db } from "@/lib/db";
import { ProductFormWrapper } from "./product-form-wrapper";
import { ProductList } from "./product-list";

export default async function ProductsPage() {
  const categories = await db.category.findMany({
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      {/* هدر صفحه: تیتر سمت راست، دکمه افزودن سمت چپ */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">مدیریت محصولات</h1>
          <p className="text-sm text-muted-foreground mt-1">
            لیست تمام محصولات فروشگاه و مدیریت موجودی
          </p>
        </div>

        {/* دکمه که فرم را باز می‌کند */}
        <ProductFormWrapper categories={categories} />
      </div>

      {/* لیست محصولات (که الان تمام صفحه را گرفته و زیباست) */}
      <ProductList />
    </div>
  );
}
