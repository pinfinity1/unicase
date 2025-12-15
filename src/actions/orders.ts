"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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
    // ۲. محاسبه قیمت کل (جهت اطمینان سمت سرور هم حساب میکنیم)
    const totalPrice = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // ۳. شروع تراکنش (Transaction)
    // یعنی یا همه مراحل انجام میشه، یا هیچکدوم (برای جلوگیری از باگ موجودی)
    const order = await db.$transaction(async (tx) => {
      // الف) چک کردن موجودی انبار
      for (const item of cartItems) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product || product.stock < item.quantity) {
          throw new Error(`موجودی محصول "${product?.name}" کافی نیست.`);
        }
      }

      // ب) ثبت سفارش
      const newOrder = await tx.order.create({
        data: {
          userId: userId || null, // اگر مهمان بود null میشه
          recipientName,
          recipientPhone,
          city,
          address,
          postalCode,
          totalPrice,
          status: "PENDING", // در انتظار پرداخت
          items: {
            create: cartItems.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      // ج) کم کردن موجودی انبار
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.id },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    revalidatePath("/admin/orders");
    revalidatePath("/");

    return {
      success: true,
      message: "سفارش با موفقیت ثبت شد",
      orderId: order.id,
    };
  } catch (error) {
    console.error("Order Error:", error);
    const message = error instanceof Error ? error.message : "خطا در ثبت سفارش";
    return { success: false, message };
  }
}
