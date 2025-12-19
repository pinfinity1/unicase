import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { CreateBrandDialog } from "@/components/admin/brands/create-brand-dialog"; // 👈 ایمپورت جدید
import { BrandActions } from "@/components/admin/brands/brand-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function BrandsPage() {
  await requireAdmin();

  const brands = await db.brand.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          مدیریت برندها
        </h1>

        {/* 👇 کل لاجیک دکمه و مودال اینجا قرار گرفت */}
        <CreateBrandDialog />
      </div>

      <div className="glass-prism rounded-3xl p-1 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-b border-gray-200/50">
              <TableHead className="text-right pr-6">نام برند</TableHead>
              <TableHead className="text-right">نامک (Slug)</TableHead>
              <TableHead className="text-center">تعداد محصول</TableHead>
              <TableHead className="w-20"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-32 text-center text-gray-500"
                >
                  هنوز برندی ثبت نشده است.
                </TableCell>
              </TableRow>
            ) : (
              brands.map((brand) => (
                <TableRow
                  key={brand.id}
                  className="hover:bg-white/40 transition-colors border-b border-gray-50 last:border-0"
                >
                  <TableCell className="font-bold pr-6">{brand.name}</TableCell>
                  <TableCell className="font-mono text-gray-500 text-sm">
                    {brand.slug}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                      {brand._count.products}
                    </span>
                  </TableCell>
                  <TableCell>
                    <BrandActions brand={brand} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
