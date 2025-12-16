import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*", // تمام ربات‌ها
      allow: "/", // اجازه دسترسی به همه صفحات
      disallow: ["/admin/", "/profile/"], // ⛔️ ربات‌ها حق ندارند وارد پنل ادمین یا پروفایل کاربران شوند
    },
    sitemap: `${baseUrl}/sitemap.xml`, // آدرس نقشه سایتی که در مرحله قبل ساختیم
  };
}
