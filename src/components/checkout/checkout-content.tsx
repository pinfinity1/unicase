"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Address } from "@prisma/client";

import { createOrder } from "@/actions/orders";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";

import { ShippingForm } from "./shipping-form";
import { OrderSummary } from "./order-summary";
import {
  ShippingMethodSelector,
  ShippingMethod,
} from "./shipping-method-selector";

interface ServerCartItem {
  id: string;
  quantity: number;
  productId: string;
  product: {
    id: string;
    name: string;
    image: string | null;
    price: number;
    slug: string;
  };
}

interface CheckoutContentProps {
  initialItems: ServerCartItem[];
  initialTotalPrice: number;
  addresses: Address[];
  shippingMethods: ShippingMethod[];
}

export function CheckoutContent({
  initialItems,
  initialTotalPrice,
  addresses,
  shippingMethods = [],
}: CheckoutContentProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const items = initialItems;
  const clearCart = useCartStore((state) => state.clearCart);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );

  // انتخاب پیش‌فرض اولین روش ارسال
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(
    shippingMethods.length > 0 ? shippingMethods[0].id : null
  );

  const currentShippingMethod = shippingMethods.find(
    (m) => m.id === selectedMethodId
  );
  const currentShippingCost = currentShippingMethod
    ? currentShippingMethod.price
    : 0;

  const [formData, setFormData] = useState({
    recipientName: "",
    recipientPhone: "",
    province: "",
    city: "",
    address: "",
    postalCode: "",
  });

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (addressId === "new") {
      setFormData({
        recipientName: "",
        recipientPhone: "",
        province: "",
        city: "",
        address: "",
        postalCode: "",
      });
      return;
    }

    const selected = addresses.find((a) => a.id === addressId);
    if (selected) {
      setFormData({
        recipientName: selected.recipientName,
        recipientPhone: selected.recipientPhone,
        province: selected.province,
        city: selected.city,
        address: selected.fullAddress,
        postalCode: selected.postalCode,
      });
      toast.success("آدرس انتخاب شد");
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 👇 تابع هندلر پرداخت (تغییر یافته: حذف e:FormEvent)
  const handlePayment = async () => {
    if (!items || items.length === 0) {
      toast.error("سبد خرید شما خالی است");
      return;
    }

    if (!selectedAddressId) {
      toast.error("لطفاً یک آدرس را انتخاب کنید.");
      return;
    }

    // اعتبارسنجی دستی برای زمانی که آدرس جدید است
    if (selectedAddressId === "new") {
      if (
        !formData.recipientName ||
        !formData.recipientPhone ||
        !formData.address ||
        !formData.city ||
        !formData.province
      ) {
        toast.error("لطفاً تمام فیلدهای آدرس را پر کنید.");
        return;
      }
    }

    if (!selectedMethodId) {
      toast.error("لطفاً روش ارسال را انتخاب کنید.");
      return;
    }

    setIsLoading(true);

    try {
      const userId = session?.user?.id;
      const orderItems = items.map((item) => ({
        id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const result = await createOrder(
        formData,
        orderItems,
        userId,
        selectedMethodId
      );

      if (result.success) {
        if (result.url) {
          window.location.href = result.url;
        } else {
          toast.success("سفارش با موفقیت ثبت شد.");
          clearCart();
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
      <div className="lg:col-span-7 space-y-8">
        <ShippingForm
          addresses={addresses}
          formData={formData}
          onChange={handleInputChange}
          onAddressSelect={handleAddressSelect}
          onSubmit={(e) => e.preventDefault()} // جلوگیری از ریلود اگر اینتر زده شد
          selectedAddressId={selectedAddressId}
        />

        <div className="rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm">
          <ShippingMethodSelector
            methods={shippingMethods}
            selectedMethodId={selectedMethodId}
            onSelect={setSelectedMethodId}
          />
        </div>
      </div>

      <div className="lg:col-span-5 lg:sticky lg:top-24">
        <OrderSummary
          items={items}
          subtotal={initialTotalPrice}
          shippingCost={currentShippingCost}
          isLoading={isLoading}
          onPay={handlePayment} // 👈 اتصال تابع به دکمه
        />
      </div>
    </div>
  );
}
