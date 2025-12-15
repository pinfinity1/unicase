import { CategoryList } from "@/components/admin/categories/category-list";
import { CategoryFormWrapper } from "@/components/admin/categories/category-form-wrapper";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          مدیریت دسته‌بندی‌ها
        </h1>

        <CategoryFormWrapper />
      </div>

      <CategoryList />
    </div>
  );
}
