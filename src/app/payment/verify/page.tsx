import { db } from "@/lib/db";
import { verifyPayment } from "@/lib/zarinpal";
import { redirect } from "next/navigation";
import Link from "next/link";
import { XCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VerifyPageProps {
  searchParams: Promise<{
    Authority: string;
    Status: string;
  }>;
}

export default async function VerifyPage(props: VerifyPageProps) {
  // در Next.js 15 پارامترها پرامیس هستند و باید await شوند
  const { Authority, Status } = await props.searchParams;

  if (!Authority) {
    return (
      <div className="flex min-h-screen items-center justify-center text-red-500">
        خطا: شناسه پرداخت یافت نشد.
      </div>
    );
  }

  // ۱. پیدا کردن سفارش مرتبط
  const order = await db.order.findUnique({
    where: { paymentAuthority: Authority },
    include: { items: true },
  });

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        سفارش یافت نشد.
      </div>
    );
  }

  // ۲. چک کردن اینکه قبلاً پرداخت شده یا نه (Idempotency)
  // اگر کاربر صفحه را رفرش کرد، دوباره پروسه کسر موجودی طی نشود
  if (order.status === "PROCESSING" || order.status === "COMPLETED") {
    redirect(`/checkout/success/${order.id}`);
  }

  // ۳. سناریوی شکست یا انصراف
  if (Status !== "OK") {
    // 🚨 حیاتی: بازگرداندن موجودی کسر شده به انبار
    await db.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      // سفارش را لغو می‌کنیم (یا می‌توانید حذف کنید)
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    });

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-red-50/50 p-4 text-center">
        <XCircle className="h-20 w-20 text-red-500 animate-pulse" />
        <h1 className="text-2xl font-bold text-gray-900">پرداخت ناموفق بود</h1>
        <p className="text-gray-600 max-w-md">
          عملیات پرداخت توسط شما لغو شد یا با خطا مواجه گردید. نگران نباشید، اگر
          مبلغی کسر شده باشد طی ۷۲ ساعت به حساب شما بازمی‌گردد.
        </p>
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link href="/cart">بازگشت به سبد خرید</Link>
          </Button>
          <Button asChild>
            <Link href="/checkout">تلاش مجدد</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ۴. تایید نهایی با زرین‌پال (Server-to-Server Verification)
  const verification = await verifyPayment(Number(order.totalPrice), Authority);

  if (verification.success && verification.refId) {
    // ✅ موفقیت آمیز
    await db.$transaction(async (tx) => {
      // الف) آپدیت وضعیت سفارش
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PROCESSING", // وضعیت: در حال پردازش
          paymentRefId: verification.refId!.toString(),
        },
      });

      // ب) پاکسازی سبد خرید دیتابیس (فقط برای کاربر لاگین شده)
      if (order.userId) {
        const cart = await tx.cart.findUnique({
          where: { userId: order.userId },
        });
        if (cart) {
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
          });
        }
      }
    });

    // هدایت به صفحه تشکر
    redirect(`/checkout/success/${order.id}`);
  } else {
    // ❌ خطا در تایید نهایی (مثلاً مبلغ دستکاری شده یا توکن منقضی شده)
    // اینجا هم باید موجودی را برگردانیم
    await db.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      await tx.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
    });

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4">
        <div className="rounded-2xl bg-white p-8 shadow-xl text-center border border-red-100">
          <RefreshCcw className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            خطا در تایید تراکنش
          </h2>
          <p className="text-gray-500 mb-6">
            تاییدیه پرداخت از سمت بانک دریافت نشد. <br />
            کد خطا: {verification.code}
          </p>
          <Button asChild className="w-full">
            <Link href="/cart">بازگشت به فروشگاه</Link>
          </Button>
        </div>
      </div>
    );
  }
}
