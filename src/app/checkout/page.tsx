// مسیر: src/app/checkout/page.tsx
import { CheckoutContent } from "@/components/checkout/checkout-content";
import { getCart } from "@/lib/cart";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  // ۱. دریافت سبد خرید از دیتابیس
  const cart = await getCart();

  // ۲. اگر سبد خالی بود، ریدایرکت به صفحه سبد خرید
  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  // ۳. تبدیل دیتا برای رفع خطای تایپ‌اسکریپت (Decimal به number)
  const formattedItems = cart.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    productId: item.productId,
    product: {
      id: item.product.id,
      name: item.product.name,
      image: item.product.image,
      slug: item.product.slug,
      // 👇 نکته کلیدی: تبدیل Decimal به number
      price: item.product.price.toNumber(),
    },
  }));

  // ۴. محاسبه قیمت کل (حالا که قیمت‌ها number هستند راحت‌تر محاسبه می‌شود)
  const totalPrice = formattedItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto px-4">
        <CheckoutContent
          initialItems={formattedItems}
          initialTotalPrice={totalPrice}
        />
      </div>
    </div>
  );
}
