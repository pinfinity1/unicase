"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Loader2,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  CheckCircle,
} from "lucide-react";

import { createOrder } from "@/actions/orders";
import { useCartStore } from "@/store/cart-store"; // فقط برای پاک کردن استور بعد از خرید
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// تعریف دقیق تایپ آیتم‌هایی که از سرور می‌آیند
interface ServerCartItem {
  id: string; // شناسه آیتم سبد خرید
  quantity: number;
  productId: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number; // دقت کنید در کامپوننت والد (page.tsx) باید Decimal به number تبدیل شده باشد
    slug: string;
  };
}

interface CheckoutContentProps {
  initialItems: ServerCartItem[];
  initialTotalPrice: number;
}

export function CheckoutContent({
  initialItems,
  initialTotalPrice,
}: CheckoutContentProps) {
  const router = useRouter();
  const { data: session } = useSession();

  // استفاده از دیتای سرور به عنوان منبع حقیقت
  const items = initialItems;
  const totalPrice = initialTotalPrice;

  // فقط متد پاکسازی را از استور کلاینت می‌گیریم تا بج هدر آپدیت شود
  const clearCart = useCartStore((state) => state.clearCart);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipientName: "",
    recipientPhone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!items || items.length === 0) {
      toast.error("سبد خرید شما خالی است");
      return;
    }

    setIsLoading(true);

    try {
      const userId = session?.user?.id;

      // فرمت‌دهی آیتم‌ها برای ارسال به سرور اکشن
      // اکشن createOrder انتظار دارد id همان productId باشد
      const orderItems = items.map((item) => ({
        id: item.product.id, // شناسه محصول
        quantity: item.quantity,
        price: item.product.price,
      }));

      const result = await createOrder(formData, orderItems, userId);

      if (result.success) {
        if (result.url) {
          toast.loading("در حال انتقال به درگاه پرداخت...");
          window.location.href = result.url;
        } else {
          // اگر پرداخت آنلاین نبود یا در حالت تست
          toast.success("سفارش با موفقیت ثبت شد.");
          clearCart(); // پاک کردن سبد خرید کلاینت (بج هدر)
          router.push("/profile/orders");
        }
      } else {
        toast.error(result.message || "خطا در ثبت سفارش");
      }
    } catch (error) {
      console.error(error);
      toast.error("خطای سیستمی رخ داده است.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-gray-500">سبد خرید شما خالی است.</p>
        <Button onClick={() => router.push("/")}>بازگشت به فروشگاه</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ستون راست: فرم اطلاعات */}
      <div className="lg:col-span-7 space-y-6">
        <div className="rounded-[32px] border border-white bg-white/80 backdrop-blur-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            اطلاعات ارسال
          </h2>

          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* نام و شماره تماس */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 mr-2">
                  نام و نام خانوادگی گیرنده
                </Label>
                <div className="relative">
                  <User className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <Input
                    name="recipientName"
                    placeholder="مثلاً: علی محمدی"
                    required
                    className="h-12 rounded-2xl border-none bg-gray-100/50 pr-10 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 mr-2">
                  شماره موبایل
                </Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3.5 h-5 w-5 text-gray-400 pointer-events-none" />
                  <Input
                    name="recipientPhone"
                    placeholder="0912..."
                    required
                    type="tel"
                    className="h-12 rounded-2xl border-none bg-gray-100/50 pr-10 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner font-mono dir-ltr text-right"
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* استان و شهر */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 mr-2">استان</Label>
                <Input
                  name="province"
                  placeholder="تهران"
                  required
                  className="h-12 rounded-2xl border-none bg-gray-100/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 mr-2">شهر</Label>
                <Input
                  name="city"
                  placeholder="تهران"
                  required
                  className="h-12 rounded-2xl border-none bg-gray-100/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* آدرس کامل */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 mr-2">
                آدرس پستی دقیق
              </Label>
              <Textarea
                name="address"
                placeholder="خیابان، کوچه، پلاک، واحد..."
                required
                className="min-h-[100px] rounded-2xl border-none bg-gray-100/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner resize-none pt-3"
                onChange={handleInputChange}
              />
            </div>

            {/* کد پستی */}
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 mr-2">کد پستی</Label>
              <Input
                name="postalCode"
                placeholder="1234567890"
                required
                className="h-12 rounded-2xl border-none bg-gray-100/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner font-mono text-left dir-ltr"
                onChange={handleInputChange}
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-500 bg-blue-50 p-4 rounded-2xl border border-blue-100">
          <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
          <p className="leading-5">
            اطلاعات شما با پروتکل‌های امن SSL رمزنگاری می‌شود و نزد ما محفوظ
            است.
          </p>
        </div>
      </div>

      {/* ستون چپ: خلاصه سفارش */}
      <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
        <div className="rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-2xl p-6 shadow-xl shadow-gray-200/50">
          <h3 className="font-bold text-gray-900 mb-6 text-lg">مرور سفارش</h3>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 items-center bg-white/50 p-2 rounded-2xl border border-white/40 transition-colors hover:bg-white/80"
              >
                <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-white">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                      بدون عکس
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate mb-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>{item.quantity} عدد</span>
                    <span className="text-gray-300">|</span>
                    <span>
                      {new Intl.NumberFormat("fa-IR").format(
                        item.product.price
                      )}{" "}
                      تومان
                    </span>
                  </p>
                </div>
                <div className="text-sm font-mono font-bold text-gray-900 pl-2">
                  {new Intl.NumberFormat("fa-IR").format(
                    item.product.price * item.quantity
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200/50 pt-4 space-y-3">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>جمع کل کالاها</span>
              <span className="font-mono font-medium">
                {new Intl.NumberFormat("fa-IR").format(totalPrice || 0)} تومان
              </span>
            </div>
            <div className="flex justify-between items-center text-sm text-green-600 font-medium">
              <span>هزینه ارسال</span>
              <span className="bg-green-100 px-2 py-0.5 rounded-lg text-xs">
                رایگان
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200/50">
            <span className="font-bold text-gray-800 text-lg">مبلغ نهایی</span>
            <span className="text-2xl font-black text-gray-900 font-mono">
              {new Intl.NumberFormat("fa-IR").format(totalPrice || 0)}{" "}
              <span className="text-sm font-normal text-gray-500 tracking-tighter">
                تومان
              </span>
            </span>
          </div>

          <Button
            type="submit"
            form="checkout-form"
            disabled={isLoading}
            className="w-full h-14 mt-6 text-lg font-bold rounded-2xl bg-gray-900 hover:bg-black text-white shadow-lg shadow-gray-200 transition-all active:scale-[0.98] hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                در حال پردازش...
              </>
            ) : (
              <>
                <CheckCircle className="ml-2 h-5 w-5" />
                ثبت نهایی و پرداخت
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
