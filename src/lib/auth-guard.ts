// مسیر: src/lib/auth-guard.ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();

  // ۱. اگر اصلا لاگین نبود
  if (!session || !session.user) {
    // می‌تونیم ارور بدیم یا ریدایرکت کنیم. برای اکشن‌ها ارور بهتره.
    throw new Error("لطفاً ابتدا وارد حساب کاربری شوید.");
  }

  // ۲. اگر لاگین بود ولی ادمین نبود
  if (session.user.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز! شما مدیر سیستم نیستید.");
  }

  // ۳. اگر همه چی اوکی بود، اطلاعات کاربر رو برگردون
  return session.user;
}
