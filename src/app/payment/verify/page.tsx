import { db } from "@/lib/db";
import { verifyPayment } from "@/lib/zarinpal";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

interface VerifyPageProps {
  searchParams: Promise<{
    Authority: string;
    Status: string;
  }>;
}

export default async function VerifyPage(props: VerifyPageProps) {
  const { Authority, Status } = await props.searchParams;

  // ۱. بررسی اولیه
  if (!Authority || Status !== "OK") {
    return <PaymentFailed message="پرداخت توسط کاربر لغو شد یا ناموفق بود." />;
  }

  // ۲. پیدا کردن سفارش با Authority
  const order = await db.order.findUnique({
    where: { paymentAuthority: Authority },
  });

  if (!order) {
    return <PaymentFailed message="سفارش مورد نظر یافت نشد." />;
  }

  // ۳. استعلام نهایی از زرین‌پال
  // مبلغ در دیتابیس دسیمال است، باید نامبر شود
  const verify = await verifyPayment(order.totalPrice.toNumber(), Authority);

  if (verify.success) {
    // ۴. آپدیت موفقیت‌آمیز سفارش
    await db.order.update({
      where: { id: order.id },
      data: {
        status: "PROCESSING", // تغییر وضعیت به "در حال پردازش"
        paymentRefId: verify.refId?.toString(),
      },
    });

    // ریدایرکت به صفحه تشکر اصلی خودمان
    redirect(`/checkout/success/${order.id}`);
  } else {
    return <PaymentFailed message="تایید نهایی پرداخت با خطا مواجه شد." />;
  }
}

// کامپوننت ساده برای نمایش خطا
function PaymentFailed({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-4 bg-red-50 text-center">
      <div className="rounded-full bg-red-100 p-6">
        <XCircle className="h-16 w-16 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-red-700">پرداخت ناموفق</h1>
      <p className="text-gray-600">{message}</p>
      <div className="flex gap-4 mt-4">
        <Button asChild variant="outline">
          <Link href="/cart">بازگشت به سبد خرید</Link>
        </Button>
        <Button asChild>
          <Link href="/">صفحه اصلی</Link>
        </Button>
      </div>
    </div>
  );
}
