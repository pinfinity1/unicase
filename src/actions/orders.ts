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
  formData: {
    recipientName: string;
    recipientPhone: string;
    province: string;
    city: string;
    address: string;
    postalCode: string;
  },
  cartItems: CartItemInput[],
  userId?: string,
  shippingMethodId?: string | null // 👈 پارامتر جدید: آیدی روش ارسال
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

  // 👈 استان (province) هم باید استخراج شود
  const { recipientName, recipientPhone, province, city, address, postalCode } =
    validated.data;

  try {
    // ۱. شروع تراکنش دیتابیس
    const order = await db.$transaction(async (tx) => {
      let calculatedItemsPrice = 0; // قیمت کالاها
      let shippingCost = 0; // هزینه ارسال
      const orderItemsData = [];

      // الف) محاسبه هزینه ارسال (امنیت: خواندن از دیتابیس)
      if (shippingMethodId) {
        const method = await tx.shippingMethod.findUnique({
          where: { id: shippingMethodId },
        });

        if (method) {
          shippingCost = method.price.toNumber();
        } else {
          // اگر روش ارسال پیدا نشد، می‌توانیم ارور بدهیم یا هزینه را 0 بگیریم
          // throw new Error("روش ارسال انتخابی معتبر نیست.");
        }
      }

      // ب) حلقه روی آیتم‌ها (چک موجودی و محاسبه قیمت کالاها)
      for (const item of cartItems) {
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error(`محصول با شناسه ${item.id} یافت نشد.`);
        }

        if (!product.isAvailable) {
          throw new Error(`محصول "${product.name}" قابل فروش نیست.`);
        }

        // عملیات اتمیک کسر موجودی
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.id,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(`موجودی محصول "${product.name}" کافی نیست.`);
        }

        const realPrice = Number(product.price);
        calculatedItemsPrice += realPrice * item.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
        });
      }

      // ج) محاسبه قیمت نهایی (کالاها + هزینه ارسال)
      const finalTotalPrice = calculatedItemsPrice + shippingCost;

      // د) ساخت نهایی سفارش
      const newOrder = await tx.order.create({
        data: {
          userId: userId || null,
          recipientName,
          recipientPhone,
          province, // 👈 ذخیره استان
          city,
          address, // در مدل دیتابیس فیلد address دارید که همان fullAddress است
          postalCode,

          shippingMethodId, // 👈 ذخیره آیدی روش ارسال
          shippingCost, // 👈 ذخیره هزینه ارسال در لحظه خرید

          totalPrice: finalTotalPrice, // 👈 قیمت نهایی
          status: "PENDING",
          items: {
            create: orderItemsData,
          },
        },
      });

      return newOrder;
    });

    // ۲. درخواست پرداخت
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const payment = await requestPayment(
      Number(order.totalPrice),
      `سفارش ${order.id}`,
      `${appUrl}/payment/verify`,
      recipientPhone
    );

    if (payment.success && payment.authority) {
      await db.order.update({
        where: { id: order.id },
        data: {
          // در مدل شما paymentAuthority در جدول Payment است یا Order؟
          // اگر در Order ندارید، باید در جدول Payment رکورد بسازید.
          // فرض بر این است که طبق مدل جدید، Authority در جدول Payment ذخیره می‌شود:
          payments: {
            create: {
              amount: order.totalPrice,
              authority: payment.authority,
              status: "PENDING",
              gateway: "ZARINPAL",
            },
          },
          // اگر فیلد paymentAuthority هنوز در مدل Order هست، خط زیر را آنکامنت کنید:
          // paymentAuthority: payment.authority
        },
      });

      return {
        success: true,
        url: payment.url,
      };
    } else {
      // رول‌بک دستی در صورت خطای درگاه
      for (const item of cartItems) {
        await db.product.update({
          where: { id: item.id },
          data: { stock: { increment: item.quantity } },
        });
      }

      await db.order.delete({ where: { id: order.id } });

      console.error("ZarinPal Error Log:", payment.error);
      return {
        success: false,
        message: "خطا در ارتباط با درگاه پرداخت. سفارش لغو شد.",
      };
    }
  } catch (error: any) {
    console.error("Order Creation Error:", error);
    return {
      success: false,
      message: error.message || "خطا در ثبت سفارش",
    };
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
