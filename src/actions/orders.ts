"use server";

import { db } from "@/lib/db";
import { z } from "zod";
import { requestPayment } from "@/lib/zarinpal";
import { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

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
  variantId?: string | null;
  quantity: number;
};

export type OrderState = {
  success?: boolean;
  message?: string;
  orderId?: string;
  url?: string;
  errors?: Record<string, string[]>;
};

export async function createOrder(
  formData: any,
  cartItems: CartItemInput[],
  userId?: string,
  shippingMethodId?: string | null
): Promise<OrderState> {
  const validated = OrderSchema.safeParse(formData);
  if (!validated.success || cartItems.length === 0) {
    return { success: false, message: "اطلاعات نامعتبر است" };
  }

  const { recipientName, recipientPhone, province, city, address, postalCode } =
    validated.data;

  try {
    // مرحله ۱: تراکنش دیتابیس (بسیار سریع و بدون شبکه)
    const order = await db.$transaction(
      async (tx) => {
        let shippingCost = 0;
        if (shippingMethodId) {
          const method = await tx.shippingMethod.findUnique({
            where: { id: shippingMethodId },
          });
          if (method) shippingCost = method.price.toNumber();
        }

        let calculatedItemsPrice = 0;
        const orderItemsData = [];

        for (const item of cartItems) {
          // کسر موجودی به صورت هوشمند (واریانت یا محصول اصلی)
          if (item.variantId) {
            const updateResult = await tx.productVariant.updateMany({
              where: { id: item.variantId, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (updateResult.count === 0)
              throw new Error("موجودی واریانت کافی نیست");
          } else {
            const updateResult = await tx.product.updateMany({
              where: { id: item.id, stock: { gte: item.quantity } },
              data: { stock: { decrement: item.quantity } },
            });
            if (updateResult.count === 0)
              throw new Error("موجودی محصول کافی نیست");
          }

          const product = await tx.product.findUnique({
            where: { id: item.id },
          });
          const price = Number(product!.price);
          calculatedItemsPrice += price * item.quantity;

          orderItemsData.push({
            productId: item.id,
            variantId: item.variantId || null,
            quantity: item.quantity,
            price: product!.price,
          });
        }

        return await tx.order.create({
          data: {
            userId: userId || null,
            totalPrice: calculatedItemsPrice + shippingCost,
            recipientName,
            recipientPhone,
            province,
            city,
            address,
            postalCode,
            shippingMethodId,
            shippingCost,
            status: "PENDING",
            items: { create: orderItemsData },
          },
        });
      },
      { timeout: 10000 }
    ); // حداکثر ۱۰ ثانیه برای جلوگیری از قفل شدن طولانی

    // مرحله ۲: درخواست پرداخت (خارج از تراکنش)
    const payment = await requestPayment(
      Number(order.totalPrice),
      `سفارش ${order.id}`,
      `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
      recipientPhone
    );

    if (payment.success && payment.authority) {
      await db.payment.create({
        data: {
          orderId: order.id,
          amount: order.totalPrice,
          authority: payment.authority,
          gateway: "ZARINPAL",
        },
      });
      return { success: true, url: payment.url };
    }

    // در صورت شکست در اتصال به درگاه، سفارش لغو نمی‌شود بلکه PENDING می‌ماند
    // تا کاربر بتواند دوباره تلاش کند (Best Practice فروشگاهی)
    return {
      success: false,
      message: "خطا در اتصال به درگاه؛ لطفاً از پنل کاربری مجدد تلاش کنید.",
    };
  } catch (error: any) {
    return { success: false, message: error.message || "خطا در ثبت سفارش" };
  }
}

// ------------------------------------------------------------------
// توابع ادمین
// ------------------------------------------------------------------

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus
) {
  try {
    await db.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
    revalidatePath("/admin/orders");
    return { success: true, message: "وضعیت سفارش آپدیت شد." };
  } catch (error) {
    return { success: false, message: "خطا در تغییر وضعیت." };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await db.order.delete({ where: { id: orderId } });
    revalidatePath("/admin/orders");
    return { success: true, message: "سفارش با موفقیت حذف شد." };
  } catch (error) {
    return { success: false, message: "خطا در حذف سفارش." };
  }
}

export async function bulkUpdateOrderStatus(
  orderIds: string[],
  newStatus: OrderStatus
) {
  try {
    await db.order.updateMany({
      where: { id: { in: orderIds } },
      data: { status: newStatus },
    });
    revalidatePath("/admin/orders");
    return {
      success: true,
      message: `${orderIds.length} سفارش با موفقیت آپدیت شدند.`,
    };
  } catch (error) {
    return { success: false, message: "خطا در آپدیت گروهی." };
  }
}
