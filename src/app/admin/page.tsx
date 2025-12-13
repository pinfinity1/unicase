export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">داشبورد مدیریت</h1>
      </div>

      {/* کارت‌های خلاصه وضعیت */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            تعداد محصولات
          </h3>
          <div className="mt-2 text-3xl font-bold text-primary">۰</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            سفارشات جدید
          </h3>
          <div className="mt-2 text-3xl font-bold text-primary">۰</div>
        </div>

        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground">
            کاربران کل
          </h3>
          <div className="mt-2 text-3xl font-bold text-primary">۱</div>
        </div>
      </div>
    </div>
  );
}
