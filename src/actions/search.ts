"use server";

import { db } from "@/lib/db";
import { serializeProduct, toEnglishDigits } from "@/lib/utils";
import { unstable_cache } from "next/cache";

function toPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

function normalizeBase(str: string): string {
  if (!str) return "";
  return str.trim().toLowerCase();
}

/**
 * تولید تنوع‌های مختلف از یک کلمه برای پوشش غلط‌های املایی رایج (ی/ي، ک/ك)
 * و جابجایی اعداد فارسی و انگلیسی
 */
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
  variations.add(term.replace(/ک/g, "ك"));
  variations.add(term.replace(/ك/g, "ک"));

  return Array.from(variations);
}

/**
 * لایه‌ی کش (Performance Tuning)
 * نتایج جستجو را برای ۱ ساعت در حافظه موقت نگه می‌دارد تا فشار روی دیتابیس کاهش یابد.
 */
const getCachedSearch = unstable_cache(
  async (rawTerms: string[]) => {
    return await db.product.findMany({
      where: {
        AND: [
          { isAvailable: true },
          { isArchived: false },
          {
            AND: rawTerms.map((term) => {
              const variations = generateVariations(term);
              return {
                OR: variations.flatMap((v) => [
                  // ۱. جستجو در نام و مشخصات محصول
                  { name: { contains: v, mode: "insensitive" } },
                  { nameEn: { contains: v, mode: "insensitive" } },
                  { slug: { contains: v, mode: "insensitive" } },
                  { description: { contains: v, mode: "insensitive" } },

                  // ۲. جستجو در نام دسته‌بندی
                  { category: { name: { contains: v, mode: "insensitive" } } },
                  {
                    category: { nameEn: { contains: v, mode: "insensitive" } },
                  },

                  // ۳. جستجو در نام برند
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
      include: {
        category: true,
        brand: true,
      },
    });
  },
  ["product-search-cache-key"], // کلید کش
  {
    revalidate: 3600, // انقضا بعد از یک ساعت
    tags: ["products", "search"], // تگ برای پاک کردن دستی کش در زمان آپدیت محصولات
  }
);

/**
 * اکشن اصلی جستجو
 */
export async function searchProducts(query: string) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const baseQuery = normalizeBase(query);
  const rawTerms = baseQuery.split(/\s+/).filter((t) => t.length > 0);

  try {
    // فراخوانی تابع با استفاده از مکانیزم کشینگ نکس‌جی‌اس
    const products = await getCachedSearch(rawTerms);
    return products.map(serializeProduct);
  } catch (error) {
    console.error("Search Action Error:", error);
    return [];
  }
}

/**
 * تابع پیشنهادات شانس (Lucky Suggestions)
 * برای نمایش محصولاتی که دارای تخفیف هستند در باکس جستجو
 */
export async function getLuckySuggestions() {
  return await unstable_cache(
    async () => {
      try {
        const products = await db.product.findMany({
          where: {
            isAvailable: true,
            isArchived: false,
            discountPrice: { not: null },
          },
          take: 4,
          orderBy: { updatedAt: "desc" },
          include: {
            category: true,
            brand: true,
          },
        });
        return products.map(serializeProduct);
      } catch (error) {
        return [];
      }
    },
    ["lucky-suggestions-cache"],
    { revalidate: 1800, tags: ["products"] } // هر ۳۰ دقیقه آپدیت می‌شود
  )();
}
