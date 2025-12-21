import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings/settings-form";

export default async function SettingsPage() {
  await requireAdmin(); // امنیت سطح صفحه [cite: 1553]

  const settings = await db.siteSettings.findUnique({
    where: { id: 1 },
  });

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">تنظیمات کلی فروشگاه</h1>
        <p className="text-gray-400 text-sm">
          اطلاعات هدر، فوتر و سئوی سایت را مدیریت کنید.
        </p>
      </header>

      <SettingsForm initialData={settings} />
    </div>
  );
}
