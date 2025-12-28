import Link from "next/link";
import Image from "next/image";
import { CartControls } from "@/components/cart/cart-controls";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowLeft, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { cookies } from "next/headers";
import { cartService } from "@/services/cart-service";

export default async function CartPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const guestId = cookieStore.get("cartId")?.value;

  // ۱. دریافت دیتا از سرویس جدید
  const cart = await cartService.getCart(session?.user?.id, guestId);

  // اگر سبد خالی بود
  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 text-center px-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gray-100 text-gray-300 shadow-inner">
          <ShoppingBag className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">
            سبد خرید شما خالی است
          </h2>
          <p className="text-gray-500">هنوز محصولی را انتخاب نکرده‌اید.</p>
        </div>
        <Button
          asChild
          size="lg"
          className="mt-4 rounded-2xl bg-gray-900 text-white"
        >
          <Link href="/">مشاهده محصولات</Link>
        </Button>
      </div>
    );
  }

  // محاسبه قیمت کل
  const totalPrice = cart.items.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 tracking-tight">
          سبد خرید
        </h1>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* لیست محصولات */}
          <div className="lg:col-span-8 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row gap-4 rounded-3xl border border-white bg-white p-4 shadow-sm"
              >
                {/* عکس محصول */}
                <Link
                  href={`/products/${item.product.slug}`}
                  className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100 border border-gray-100"
                >
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400">
                      بدون تصویر
                    </div>
                  )}
                </Link>

                {/* اطلاعات */}
                <div className="flex flex-1 flex-col justify-between py-1">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-bold text-lg text-gray-900">
                      <Link href={`/products/${item.product.slug}`}>
                        {item.product.name}
                      </Link>
                    </h3>
                    <div className="font-bold text-gray-900 text-lg">
                      {new Intl.NumberFormat("fa-IR").format(
                        Number(item.product.price) * item.quantity
                      )}
                      <span className="text-xs font-normal text-gray-500 mr-1">
                        تومان
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 sm:mt-0">
                    <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                      <ShieldCheck className="h-3 w-3" />
                      <span>ضمانت اصالت</span>
                    </div>

                    {/* کنترلر تعداد (وصل شده به سرور اکشن) */}
                    <CartControls
                      itemId={item.id}
                      quantity={item.quantity}
                      maxStock={item.product.stock}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* فاکتور */}
          <div className="lg:col-span-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-6">
                خلاصه سفارش
              </h3>

              <div className="space-y-4 border-b border-gray-100 pb-6 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>مجموع اقلام</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("fa-IR").format(totalPrice)} تومان
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>هزینه ارسال</span>
                  <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-lg text-xs">
                    رایگان
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-gray-900 font-bold">
                  مبلغ قابل پرداخت
                </span>
                <span className="text-2xl font-black text-gray-900 font-mono">
                  {new Intl.NumberFormat("fa-IR").format(totalPrice)}
                  <span className="text-sm font-normal text-gray-500 mr-2 tracking-tighter">
                    تومان
                  </span>
                </span>
              </div>

              <Button
                asChild
                className="w-full h-14 text-lg font-bold rounded-2xl bg-gray-900 hover:bg-black text-white shadow-xl"
              >
                <Link href="/checkout">
                  تکمیل خرید
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
