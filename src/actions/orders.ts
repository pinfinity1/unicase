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
  // price را حذف کردیم چون نباید از کلاینت بیاید (امنیتی)
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
    // ۱. شروع تراکنش دیتابیس
    const order = await db.$transaction(async (tx) => {
      let calculatedTotalPrice = 0;
      const orderItemsData = [];

      // حلقه روی آیتم‌ها برای: ۱. چک موجودی اتمیک ۲. محاسبه قیمت واقعی
      for (const item of cartItems) {
        // الف) دریافت قیمت واقعی از دیتابیس
        const product = await tx.product.findUnique({
          where: { id: item.id },
        });

        if (!product) {
          throw new Error(`محصول با شناسه ${item.id} یافت نشد.`);
        }

        if (!product.isAvailable) {
          throw new Error(`محصول "${product.name}" قابل فروش نیست.`);
        }

        // ب) عملیات اتمیک: فقط در صورتی کم کن که موجودی >= تعداد درخواستی باشد
        // از updateMany استفاده می‌کنیم چون اجازه فیلتر روی stock را می‌دهد
        const updateResult = await tx.product.updateMany({
          where: {
            id: item.id,
            stock: { gte: item.quantity }, // 👈 شرط حیاتی برای جلوگیری از Race Condition
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        // اگر هیچ رکوردی آپدیت نشد، یعنی موجودی کافی نبوده
        if (updateResult.count === 0) {
          throw new Error(`موجودی محصول "${product.name}" کافی نیست.`);
        }

        // ج) محاسبه قیمت امن
        const realPrice = Number(product.price);
        calculatedTotalPrice += realPrice * item.quantity;

        orderItemsData.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price, // قیمت دیتابیس رو ذخیره می‌کنیم
        });
      }

      // د) ساخت نهایی سفارش
      const newOrder = await tx.order.create({
        data: {
          userId: userId || null,
          recipientName,
          recipientPhone,
          city,
          address,
          postalCode,
          totalPrice: calculatedTotalPrice, // قیمت محاسبه شده در سرور
          status: "PENDING",
          items: {
            create: orderItemsData,
          },
        },
      });

      return newOrder;
    });

    // ۲. درخواست پرداخت (بعد از موفقیت تراکنش دیتابیس)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const payment = await requestPayment(
      Number(order.totalPrice),
      `سفارش ${order.id}`,
      `${appUrl}/payment/verify`, // حتما این فایل باید ساخته شود
      recipientPhone
    );

    if (payment.success && payment.authority) {
      await db.order.update({
        where: { id: order.id },
        data: { paymentAuthority: payment.authority },
      });

      return {
        success: true,
        url: payment.url,
      };
    } else {
      // اگر درگاه خطا داد، باید موجودی کسر شده را برگردانیم (Rollback دستی)
      // چون تراکنش دیتابیس قبلاً کامیت شده است.
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

// توابع کمکی ادمین (بدون تغییر لاجیک، فقط تایپ‌ها)
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
