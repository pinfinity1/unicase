"use client";

import { updateUserRole } from "@/actions/users";
import { toast } from "sonner";
import {
  ShieldCheck,
  ShieldAlert,
  Mail,
  Calendar,
  User as UserIcon,
} from "lucide-react";

export function UsersList({ users }: { users: any[] }) {
  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const result = await updateUserRole(userId, newRole);

    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  return (
    <div className="glass-prism rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/40">
      <table className="w-full text-right border-collapse">
        <thead>
          <tr className="bg-white/50 border-b border-gray-200/50">
            <th className="p-6 text-sm font-black text-zinc-900">کاربر</th>
            <th className="p-6 text-sm font-black text-zinc-900">
              اطلاعات تماس
            </th>
            <th className="p-6 text-sm font-black text-zinc-900">
              تاریخ عضویت
            </th>
            <th className="p-6 text-sm font-black text-zinc-900 text-center">
              نقش فعلی
            </th>
            <th className="p-6 text-sm font-black text-zinc-900 text-center">
              عملیات
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100/50">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-white/40 transition-colors group"
            >
              <td className="p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-zinc-900">
                      {user.name || "کاربر بی‌نام"}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-tighter">
                      ID: {user.id.slice(-8)}
                    </p>
                  </div>
                </div>
              </td>
              <td className="p-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-zinc-600">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    {user.email || "بدون ایمیل"}
                  </div>
                </div>
              </td>
              <td className="p-6 text-sm text-zinc-500 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  {new Date(user.createdAt).toLocaleDateString("fa-IR")}
                </div>
              </td>
              <td className="p-6 text-center">
                <span
                  className={`px-4 py-1.5 rounded-full text-[11px] font-black tracking-wide ${
                    user.role === "ADMIN"
                      ? "bg-amber-100 text-amber-700 border border-amber-200"
                      : "bg-blue-50 text-blue-600 border border-blue-100"
                  }`}
                >
                  {user.role === "ADMIN" ? "مدیر کل" : "کاربر عادی"}
                </span>
              </td>
              <td className="p-6 text-center">
                <button
                  onClick={() => handleRoleToggle(user.id, user.role)}
                  className={`p-2 rounded-xl transition-all active:scale-90 ${
                    user.role === "ADMIN"
                      ? "bg-red-50 text-red-500 hover:bg-red-100"
                      : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                  }`}
                  title={
                    user.role === "ADMIN"
                      ? "تبدیل به کاربر عادی"
                      : "ارتقا به مدیر"
                  }
                >
                  {user.role === "ADMIN" ? (
                    <ShieldAlert className="w-5 h-5" />
                  ) : (
                    <ShieldCheck className="w-5 h-5" />
                  )}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
