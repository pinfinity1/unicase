"use server";

import { db } from "@/lib/db";
import { serializeProduct } from "@/lib/utils";

// توابع کمکی (بدون تغییر)
function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d).toString())
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
}

function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

function normalizeBase(str: string): string {
  if (!str) return "";
  return str.trim().toLowerCase();
}

function generateVariations(term: string): string[] {
  const variations = new Set<string>();
  variations.add(term);
  const en = toEnglishDigits(term);
  const fa = toPersianDigits(en);
  variations.add(en);
  variations.add(fa);
  if (term.startsWith("ا")) variations.add("آ" + term.substring(1));
  else if (term.startsWith("آ")) variations.add("ا" + term.substring(1));
  variations.add(term.replace(/ي/g, "ی"));
  variations.add(term.replace(/ی/g, "ي"));
  return Array.from(variations);
}

// --- تابع اصلی جستجو ---
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
            AND: rawTerms.map((term) => {
              const variations = generateVariations(term);

              return {
                OR: variations.flatMap((v) => [
                  // ۱. جستجو در محصول
                  { name: { contains: v, mode: "insensitive" } },
                  { nameEn: { contains: v, mode: "insensitive" } },
                  { slug: { contains: v, mode: "insensitive" } },

                  // ۲. جستجو در دسته‌بندی
                  { category: { name: { contains: v, mode: "insensitive" } } },
                  {
                    category: { nameEn: { contains: v, mode: "insensitive" } },
                  },

                  // ۳. جستجو در برند (🆕 اضافه شد)
                  { brand: { name: { contains: v, mode: "insensitive" } } },
                  { brand: { nameEn: { contains: v, mode: "insensitive" } } },
                ]),
              };
            }),
          },
        ],
      },
      take: 6,
      orderBy: { createdAt: "desc" },
      // 👇 برند را هم انکلود کردیم
      include: {
        category: true,
        brand: true,
      },
    });

    return products.map(serializeProduct);
  } catch (error) {
    console.error("Search Error:", error);
    return [];
  }
}

// --- تابع پیشنهادات شانس ---
export async function getLuckySuggestions() {
  try {
    const products = await db.product.findMany({
      where: {
        isAvailable: true,
        discountPrice: { not: null },
      },
      take: 4,
      orderBy: { updatedAt: "desc" },
      include: {
        category: true,
        brand: true, // 👈 اینجا هم اضافه شد
      },
    });
    return products.map(serializeProduct);
  } catch (error) {
    return [];
  }
}
