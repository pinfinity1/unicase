import { db } from "@/lib/db";
import { verifyPayment } from "@/lib/zarinpal";
import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifyPageProps {
  searchParams: Promise<{
    Authority: string;
    Status: string;
  }>;
}

export default async function VerifyPage(props: VerifyPageProps) {
  const { Authority, Status } = await props.searchParams;

  if (!Authority) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500 font-bold">
        خطا: شناسه پرداخت یافت نشد.
      </div>
    );
  }

  // ۱. پیدا کردن تراکنش پرداخت و سفارش مرتبط (بر اساس مدل Payment)
  const paymentRecord = await db.payment.findUnique({
    where: { authority: Authority },
    include: {
      order: {
        include: { items: true },
      },
    },
  });

  if (!paymentRecord || !paymentRecord.order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        سفارش یا تراکنش معتبری یافت نشد.
      </div>
    );
  }

  const order = paymentRecord.order;

  // ۲. جلوگیری از پردازش مجدد (Idempotency)
  if (paymentRecord.status === "SUCCESS") {
    redirect(`/checkout/success/${order.id}`);
  }

  // ۳. سناریوی شکست یا انصراف کاربر در درگاه
  if (Status !== "OK") {
    await db.$transaction(async (tx) => {
      // 🚨 بازگرداندن هوشمند موجودی (محصول یا واریانت)
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      // آپدیت وضعیت پرداخت و سفارش
      await tx.payment.update({
        where: { id: paymentRecord.id },
        data: { status: "FAILED" },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    });

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 text-center">
        <XCircle className="h-20 w-20 text-red-500" />
        <h1 className="text-2xl font-bold">پرداخت ناموفق</h1>
        <p className="text-gray-600 max-w-md">
          تراکنش توسط شما لغو شد یا با خطا مواجه گردید. موجودی انبار آزاد شد.
        </p>
        <div className="flex gap-4">
          <Button asChild variant="outline">
            <Link href="/cart">سبد خرید</Link>
          </Button>
          <Button asChild>
            <Link href="/checkout">تلاش مجدد</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ۴. تایید نهایی سرور با بانک (Verification)
  const verification = await verifyPayment(
    Number(paymentRecord.amount),
    Authority
  );

  if (verification.success && verification.refId) {
    await db.$transaction(async (tx) => {
      // الف) آپدیت پرداخت و سفارش
      await tx.payment.update({
        where: { id: paymentRecord.id },
        data: { status: "SUCCESS", refId: verification.refId!.toString() },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "PROCESSING" },
      });

      // ب) پاکسازی سبد خرید
      if (order.userId) {
        await tx.cart.update({
          where: { userId: order.userId },
          data: { items: { deleteMany: {} } },
        });
      }
    });

    redirect(`/checkout/success/${order.id}`);
  } else {
    // ۵. خطای تاییدیه بانکی (برگشت موجودی)
    await db.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
      await tx.payment.update({
        where: { id: paymentRecord.id },
        data: { status: "FAILED", errorMessage: "خطای تاییدیه بانک" },
      });
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    });

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <RefreshCcw className="h-12 w-12 text-orange-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">تاییدیه بانک صادر نشد</h2>
        <Button asChild>
          <Link href="/cart">بازگشت</Link>
        </Button>
      </div>
    );
  }
}
