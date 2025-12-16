import { NextResponse } from "next/server";
import { generateLuckyDeals } from "@/actions/marketing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // بررسی رمز امنیتی
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key !== "unicase-secret-key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // اجرای تابع تخفیف (با پیش‌فرض ۱۰ درصد)
    await generateLuckyDeals(10);

    return NextResponse.json({
      success: true,
      message: "Lucky deals updated!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
