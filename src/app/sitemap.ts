import { MetadataRoute } from "next";
import { db } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // ۱. آدرس پایه سایت را از متغیرهای محیطی می‌گیریم
  // نکته: در فایل .env حتما NEXT_PUBLIC_APP_URL را ست کنید (مثلا https://unicase.ir)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // ۲. دریافت تمام محصولات فعال از دیتابیس
  // فقط اسلاگ و تاریخ آپدیت را می‌گیریم تا کوئری سبک باشد
  const products = await db.product.findMany({
    where: {
      isAvailable: true, // فقط محصولات موجود را به گوگل نشان بده
      isArchived: false,
    },
    select: {
      slug: true,
      updatedAt: true,
    },
  });

  // ۳. ساخت لینک‌های محصولات (Dynamic Routes)
  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: "daily", // به گوگل می‌گوییم احتمالاً روزانه تغییر می‌کند (قیمت/موجودی)
    priority: 0.8, // اولویت بالا (از ۰ تا ۱)
  }));

  // ۴. لینک‌های ثابت (Static Routes)
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1, // صفحه اصلی بالاترین اولویت را دارد
    },
    // اگر صفحات دیگری مثل "درباره ما" یا "تماس با ما" دارید اینجا اضافه کنید
    // {
    //   url: `${baseUrl}/about`,
    //   lastModified: new Date(),
    //   changeFrequency: "monthly",
    //   priority: 0.5,
    // },
  ];

  // ۵. ترکیب همه لینک‌ها
  return [...staticEntries, ...productEntries];
}
