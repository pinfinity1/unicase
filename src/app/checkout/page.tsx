"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cart-store";
import useStore from "@/hooks/use-store";
import { useRouter } from "next/navigation";
import { createOrder } from "@/actions/orders"; // اکشنی که ساختیم
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  ShieldCheck,
  MapPin,
  Phone,
  User,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useStore(useCartStore, (state) => state.items);
  const totalPrice = useStore(useCartStore, (state) => state.getTotalPrice());
  const clearCart = useCartStore((state) => state.clearCart);

  const [isLoading, setIsLoading] = useState(false);

  // استیت فرم
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
    if (!items || items.length === 0) return;

    setIsLoading(true);

    try {
      // فراخوانی سرور اکشن
      const result = await createOrder(formData, items);

      if (result.success) {
        toast.success("سفارش شما با موفقیت ثبت شد!");
        clearCart(); // خالی کردن سبد خرید
        // هدایت به صفحه موفقیت (یا خانه فعلا)
        router.push(`/checkout/success/${result.orderId}`);
        router.push("/");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("خطای سیستمی رخ داده است.");
    } finally {
      setIsLoading(false);
    }
  };

  if (items === undefined)
    return <div className="p-20 text-center">در حال بارگذاری...</div>;
  if (items.length === 0) {
    router.push("/cart"); // اگر سبد خالی بود برگرد
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 py-10">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* ستون راست: فرم اطلاعات (iOS Style Inputs) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-white bg-white p-6 shadow-sm">
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
                      <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
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
                      <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
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
                    className="h-12 rounded-2xl border-none bg-gray-100/50 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all shadow-inner font-mono"
                    onChange={handleInputChange}
                  />
                </div>
              </form>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-4 rounded-2xl border border-blue-100">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              اطلاعات شما با پروتکل‌های امن SSL رمزنگاری می‌شود و نزد ما محفوظ
              است.
            </div>
          </div>

          {/* ستون چپ: خلاصه سفارش (Sticky & Glass) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
            <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-2xl p-6 shadow-xl shadow-gray-200/50">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">
                مرور سفارش
              </h3>

              {/* لیست کوچک آیتم‌ها */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 items-center bg-white/50 p-2 rounded-xl border border-white/40"
                  >
                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} عدد ×{" "}
                        {new Intl.NumberFormat("fa-IR").format(item.price)}
                      </p>
                    </div>
                    <div className="text-sm font-mono font-bold text-gray-900">
                      {new Intl.NumberFormat("fa-IR").format(
                        item.price * item.quantity
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200/50 pt-4 space-y-2">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>جمع کل کالاها</span>
                  <span className="font-mono">
                    {new Intl.NumberFormat("fa-IR").format(totalPrice || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-green-600 font-medium">
                  <span>هزینه ارسال</span>
                  <span>رایگان</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200/50">
                <span className="font-bold text-gray-800">مبلغ نهایی</span>
                <span className="text-2xl font-black text-gray-900 font-mono">
                  {new Intl.NumberFormat("fa-IR").format(totalPrice || 0)}{" "}
                  <span className="text-sm font-normal text-gray-500">
                    تومان
                  </span>
                </span>
              </div>

              {/* دکمه پرداخت نهایی */}
              <Button
                type="submit"
                form="checkout-form"
                disabled={isLoading}
                className="w-full h-14 mt-6 text-lg font-bold rounded-2xl bg-gray-900 hover:bg-black text-white shadow-lg transition-transform active:scale-[0.98]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    در حال ثبت...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    ثبت نهایی و پرداخت
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
