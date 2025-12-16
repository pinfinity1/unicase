import { NextResponse } from "next/server";
import { generateFeaturedProducts } from "@/actions/marketing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    // 🔒 اصلاح امنیتی: خواندن از متغیر محیطی
    const CRON_SECRET = process.env.CRON_SECRET;

    // بررسی وجود متغیر محیطی و تطابق کلید
    if (!CRON_SECRET || key !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // اجرای تابع آپدیت
    await generateFeaturedProducts();

    return NextResponse.json({
      success: true,
      message: "Featured products updated!",
    });
  } catch (error) {
    console.error("Cron Error:", error); // لاگ کردن خطا برای دیباگ
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
