import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryActions } from "./category-actions"; // 👈 ایمپورت کامپوننت جدید

export async function CategoryList() {
  const categories = await db.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mb-4">
          <span className="text-2xl">📂</span>
        </div>
        <h3 className="text-lg font-bold">هنوز دسته‌بندی ندارید</h3>
        <p className="text-sm text-muted-foreground mt-2">
          اولین دسته‌بندی خود را ایجاد کنید تا بتوانید محصولات را اضافه کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead className="text-right font-bold w-50">
              نام دسته
            </TableHead>
            <TableHead className="text-right">لینک (Slug)</TableHead>
            <TableHead className="text-center w-25">محصولات</TableHead>
            <TableHead className="w-25 text-center">عملیات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow
              key={cat.id}
              className="hover:bg-gray-50/50 transition-colors"
            >
              <TableCell className="font-bold text-gray-900">
                {cat.name}
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground dir-ltr text-right">
                /{cat.slug}
              </TableCell>
              <TableCell className="text-center">
                <span className="inline-flex items-center justify-center rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {cat._count.products}
                </span>
              </TableCell>
              <TableCell>
                {/* 👇 استفاده از کامپوننت جدید برای ویرایش و حذف */}
                <CategoryActions category={cat} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
