import { db } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CategoryActions } from "./category-actions";
import { Layers } from "lucide-react";

export async function CategoryList() {
  const categories = await db.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[32px] border border-white/60 bg-white/40 backdrop-blur-xl p-12 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-sm text-gray-300 mb-4">
          <Layers className="h-10 w-10" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">دسته‌بندی خالی است</h3>
        <p className="text-sm text-gray-500 mt-2">
          اولین دسته‌بندی خود را ایجاد کنید.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-2xl shadow-xl shadow-gray-200/50 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="border-b border-gray-200/50 hover:bg-transparent">
            <TableHead className="text-right pr-8 font-bold text-gray-600">
              نام دسته‌بندی
            </TableHead>
            <TableHead className="text-right text-gray-600">
              نامک (Slug)
            </TableHead>
            <TableHead className="text-center text-gray-600">
              تعداد محصول
            </TableHead>
            <TableHead className="w-16"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              className="border-b border-gray-100/50 hover:bg-white/60 transition-colors"
            >
              <TableCell className="font-bold text-gray-800 text-base pr-8">
                {category.name}
              </TableCell>

              <TableCell className="font-mono text-sm text-gray-500">
                /{category.slug}
              </TableCell>

              <TableCell className="text-center">
                <span className="font-mono text-gray-700 bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {category._count.products.toLocaleString("fa")}
                </span>
              </TableCell>

              <TableCell>
                <CategoryActions category={category} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
