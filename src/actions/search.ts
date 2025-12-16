"use server";

import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";

// تبدیل اعداد
function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

// این تابع کلمات مشابه را می‌سازد
// اگر ورودی "ایفون" باشد -> خروجی ["ایفون", "آیفون"]
function generateVariations(term: string): string[] {
  const variations = new Set<string>();

  // ۱. خود کلمه اصلی
  variations.add(term);

  // ۲. حالت‌های عدد فارسی و انگلیسی
  const en = toEnglishDigits(term);
  const fa = toPersianDigits(en);
  variations.add(en);
  variations.add(fa);

  // ۳. مشکل "آ" و "ا" (مخصوص کلماتی مثل آیفون/ایفون)
  if (term.startsWith("ا")) {
    variations.add("آ" + term.substring(1)); // ایفون -> آیفون
  } else if (term.startsWith("آ")) {
    variations.add("ا" + term.substring(1)); // آیفون -> ایفون
  }

  // ۴. مشکل "ی" و "ي" (عربی/فارسی)
  variations.add(term.replace(/ي/g, "ی"));
  variations.add(term.replace(/ی/g, "ي"));

  return Array.from(variations);
}

function normalizeBase(str: string): string {
  if (!str) return "";
  return str.trim().toLowerCase();
}

export async function searchProducts(query: string) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const baseQuery = normalizeBase(query);
  const rawTerms = baseQuery.split(/\s+/).filter((t) => t.length > 0);

  try {
    const products = await db.product.findMany({
      where: {
        AND: [
          { isAvailable: true },
          { isArchived: false },
          {
            // برای هر کلمه که کاربر تایپ کرده (مثلا: "ایفون")
            AND: rawTerms.map((term) => {
              // تمام حالت‌های مشابهش را می‌سازیم ("ایفون", "آیفون", "iPhone"...)
              const variations = generateVariations(term);

              return {
                OR: variations.flatMap((v) => [
                  // جستجو در نام فارسی (با تمام حالات)
                  { name: { contains: v, mode: "insensitive" } },
                  // جستجو در نام انگلیسی
                  { nameEn: { contains: v, mode: "insensitive" } },
                  // جستجو در اسلاگ
                  { slug: { contains: v, mode: "insensitive" } },
                  // جستجو در دسته‌بندی
                  { category: { name: { contains: v, mode: "insensitive" } } },
                  {
                    category: { nameEn: { contains: v, mode: "insensitive" } },
                  },
                ]),
              };
            }),
          },
        ],
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    });

    return products.map(serializeProduct);
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
}

export async function getLuckySuggestions() {
  try {
    const products = await db.product.findMany({
      where: {
        isAvailable: true,
        discountPrice: { not: null },
      },
      take: 4,
      orderBy: { updatedAt: "desc" },
      include: { category: true },
    });
    return products.map(serializeProduct);
  } catch (error) {
    return [];
  }
}
