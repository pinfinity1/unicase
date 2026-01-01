import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// اکسپورت کردن میدلور با تنظیمات Edge-compatible
export default NextAuth(authConfig).auth;

// تنظیم اینکه میدلور روی کدام مسیرها اجرا شود
export const config = {
  // این Regex می‌گوید:
  // روی فایل‌های api, استاتیک (_next/static), عکس‌ها (_next/image) و آیکون (favicon) اجرا نشو.
  // روی بقیه مسیرها (مثل /admin و /login) اجرا شو.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
