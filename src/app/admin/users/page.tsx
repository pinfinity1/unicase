import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { UsersList } from "@/components/admin/users/users-list";
import { Users as UsersIcon, Search } from "lucide-react";

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-primary" />
            مدیریت کاربران
          </h1>
          <p className="text-zinc-500 mr-11 mt-1">
            لیست تمامی اعضا و کنترل سطح دسترسی
          </p>
        </div>

        {/* فیلتر سریع (نمایشی برای فاز فعلی) */}
        <div className="relative group">
          <input
            type="text"
            placeholder="جستجوی نام یا ایمیل..."
            className="bg-white/60 border border-gray-200 rounded-2xl py-3 pr-12 pl-4 w-full md:w-80 focus:outline-none focus:ring-2 ring-primary/20 backdrop-blur-md transition-all"
          />
          <Search className="absolute right-4 top-3.5 w-5 h-5 text-zinc-400" />
        </div>
      </header>

      <UsersList users={users} />
    </div>
  );
}
