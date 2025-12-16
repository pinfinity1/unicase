import { NextResponse } from "next/server";
import { generateLuckyDeals } from "@/actions/marketing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // بررسی رمز امنیتی
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    // 🔒 اصلاح امنیتی: خواندن از متغیر محیطی
    const CRON_SECRET = process.env.CRON_SECRET;

    // اگر متغیر محیطی ست نشده بود یا کلید اشتباه بود، خطا بده
    if (!CRON_SECRET || key !== CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // اجرای تابع تخفیف (با پیش‌فرض ۱۰ درصد)
    await generateLuckyDeals(10);

    return NextResponse.json({
      success: true,
      message: "Lucky deals updated!",
    });
  } catch (error) {
    console.error("Cron Lucky Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
