import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { auth } from "@/auth";

export async function getCart() {
  const session = await auth();
  let cart = null;

  if (session?.user?.id) {
    cart = await db.cart.findUnique({
      where: { userId: session.user.id },
      include: { items: { include: { product: true } } },
    });
  } else {
    const cookieStore = await cookies();
    const cartId = cookieStore.get("cartId")?.value;

    if (cartId) {
      cart = await db.cart.findFirst({
        where: { sessionCartId: cartId },
        include: { items: { include: { product: true } } },
      });
    }
  }

  return cart;
}

export async function getOrCreateCart() {
  // ۱. اول چک کن سبد داره یا نه
  let cart = await getCart();

  if (cart) {
    return cart;
  }

  // ۲. اگر نداشت، باید بسازیم
  const session = await auth();
  const cookieStore = await cookies();

  // 🧠 بخش هوشمند: بررسی اینکه آیا یوزر سشن واقعاً در دیتابیس هست یا نه؟
  let validUserId: string | null = null;

  if (session?.user?.id) {
    const userExists = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }, // فقط آیدی رو بگیر که سریع باشه
    });

    if (userExists) {
      validUserId = userExists.id;
    } else {
      // اگر یوزر نبود، لاگ بنداز ولی برنامه رو متوقف نکن
      console.warn(
        `⚠️ Ghost session detected for ID: ${session.user.id}. Falling back to guest cart.`
      );
    }
  }

  if (validUserId) {
    // ✅ سناریو ۱: کاربر معتبر است -> ساخت سبد کاربری
    try {
      cart = await db.cart.create({
        data: { userId: validUserId },
        include: { items: { include: { product: true } } },
      });
    } catch (error) {
      // یک لایه محافظتی دوم: اگر در فاصله چک کردن و ساختن، یوزر حذف شد
      console.error(
        "Failed to create user cart, falling back to guest:",
        error
      );
    }
  }

  // اگر به هر دلیلی cart هنوز null بود (یا کاربر مهمان بود، یا یوزر معتبر نبود)
  if (!cart) {
    // ✅ سناریو ۲: کاربر مهمان (یا سشن نامعتبر) -> ساخت سبد مهمان
    const tempId = Math.random().toString(36).substring(7) + Date.now();

    cart = await db.cart.create({
      data: { sessionCartId: tempId },
      include: { items: { include: { product: true } } },
    });

    // کوکی را ست میکنیم
    cookieStore.set("cartId", tempId, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // ۳۰ روز
      httpOnly: true,
    });
  }

  return cart;
}
