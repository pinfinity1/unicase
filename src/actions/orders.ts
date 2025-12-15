"use server";
import { db } from "@/lib/db";
import { z } from "zod";
import { requestPayment } from "@/lib/zarinpal";

const OrderSchema = z.object({
  recipientName: z.string().min(2, "نام گیرنده باید حداقل ۲ حرف باشد"),
  recipientPhone: z
    .string()
    .min(11, "شماره تماس معتبر نیست")
    .max(11, "شماره تماس معتبر نیست"),
  province: z.string().min(1, "استان را انتخاب کنید"),
  city: z.string().min(1, "شهر را وارد کنید"),
  address: z.string().min(10, "آدرس باید دقیق باشد (حداقل ۱۰ حرف)"),
  postalCode: z.string().min(5, "کد پستی الزامی است"),
});

type CartItemInput = {
  id: string;
  quantity: number;
  price: number;
};

export type OrderState = {
  success?: boolean;
  message?: string;
  orderId?: string;
  url?: string;
  errors?: Record<string, string[]>;
};

export async function createOrder(
  formData: {
    recipientName: string;
    recipientPhone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
  },
  cartItems: CartItemInput[],
  userId?: string
): Promise<OrderState> {
  const validated = OrderSchema.safeParse(formData);

  if (!validated.success) {
    return {
      success: false,
      message: "لطفاً اطلاعات را به درستی وارد کنید",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  if (cartItems.length === 0) {
    return { success: false, message: "سبد خرید خالی است" };
  }

  const { recipientName, recipientPhone, city, address, postalCode } =
    validated.data;

  try {
    const totalPrice = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // ۱. ساخت سفارش در دیتابیس
    const order = await db.$transaction(async (tx) => {
      // چک کردن موجودی
      for (const item of cartItems) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`موجودی محصول "${product?.name}" کافی نیست.`);
        }
      }

      const newOrder = await tx.order.create({
        data: {
          userId: userId || null,
          recipientName,
          recipientPhone,
          city,
          address,
          postalCode,
          totalPrice,
          status: "PENDING",
          items: {
            create: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // کم کردن موجودی
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // ۲. درخواست پرداخت از زرین‌پال (خارج از تراکنش دیتابیس)
    // نکته: برای پروداکشن باید آدرس سایت را از env بگیرید. فعلاً لوکال:
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const payment = await requestPayment(
      totalPrice,
      `سفارش ${order.id}`,
      `${appUrl}/payment/verify`,
      recipientPhone
    );

    if (payment.success && payment.authority) {
      // ✅ حالت موفق: ذخیره Authority و ارسال به بانک
      await db.order.update({
        where: { id: order.id },
        data: { paymentAuthority: payment.authority },
      });

      return {
        success: true,
        url: payment.url,
      };
    } else {
      for (const item of cartItems) {
        await db.product.update({
          where: { id: item.id },
          data: { stock: { increment: item.quantity } }, // موجودی برمی‌گردد
        });
      }

      // ۲. حذف کامل سفارش از دیتابیس (تغییر اینجاست) 👇
      await db.order.delete({
        where: { id: order.id },
      });

      // لاگ کردن خطا برای دیباگ (که بفهمیم چرا زرین‌پال ارور داده) 👇
      console.error("ZarinPal Error Log:", payment.error);

      return {
        success: false,
        message: "خطا در ارتباط با درگاه پرداخت. سفارش شما ثبت نشد.",
      };
    }
  } catch (error: any) {
    console.error("Order Error:", error);
    return {
      success: false,
      message: error.message || "خطا در ثبت سفارش",
    };
  }
}
