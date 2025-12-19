import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getCart } from "@/lib/cart";
import { redirect } from "next/navigation";
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { getShippingMethods } from "@/actions/shipping";

export default async function CheckoutPage() {
  const session = await auth();

  // اگر کاربر لاگین نیست، بفرستش صفحه ورود
  if (!session?.user) {
    redirect(`/login?callbackUrl=/checkout`);
  }

  // ۱. دریافت سبد خرید
  const cart = await getCart();

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  // ۲. دریافت آدرس‌های کاربر از دیتابیس (بخش جدید) 👈
  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" }, // آدرس پیش‌فرض اول بیاید
  });

  const shippingMethods = await getShippingMethods();

  // ۳. فرمت کردن آیتم‌ها (همان کد خودتان)
  const formattedItems = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    productId: item.productId,
    product: {
      id: item.product.id,
      name: item.product.name,
      image: item.product.image, // مطمئن شوید در مدل Product تصویر دارید
      slug: item.product.slug,
      price: item.product.price.toNumber(),
    },
  }));

  const totalPrice = formattedItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto px-4">
        {/* آدرس‌ها را هم به کلاینت پاس می‌دهیم */}
        <CheckoutContent
          initialItems={formattedItems}
          initialTotalPrice={totalPrice}
          addresses={addresses}
          shippingMethods={shippingMethods}
        />
      </div>
    </div>
  );
}
