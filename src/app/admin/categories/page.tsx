import { CategoryList } from "./category-list";
import { CategoryForm } from "./category-form";

export default function CategoriesPage() {
  return (
    <div className="space-y-6">
      {/* هدر: تیتر + دکمه افزودن */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">دسته‌بندی‌ها</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت دسته‌بندی‌های محصولات فروشگاه
          </p>
        </div>

        {/* فرم داخل این دکمه مخفی شده */}
        <CategoryForm />
      </div>

      {/* لیست جداگانه */}
      <CategoryList />
    </div>
  );
}
