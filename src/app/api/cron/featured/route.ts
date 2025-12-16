import { NextResponse } from "next/server";
import { generateFeaturedProducts } from "@/actions/marketing";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    // بررسی رمز امنیتی
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key !== "unicase-secret-key") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // اجرای تابع آپدیت محبوب‌ترین‌ها
    await generateFeaturedProducts();

    return NextResponse.json({
      success: true,
      message: "Featured products updated!",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
