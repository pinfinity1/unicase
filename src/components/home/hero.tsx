import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export function Hero() {
  return (
    <section className="relative w-full  flex flex-col items-center justify-center bg-[#F5F5F7] overflow-hidden pt-20 pb-10">
      {/* 1. هاله نور بسیار محو (Ambient Glow)
          فقط برای اینکه پشت عکس "مرده" نباشد، یک نور خاکستری/آبی خیلی محو می‌اندازیم.
      */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-gray-200 to-blue-50 blur-[120px] rounded-full opacity-60 pointer-events-none" />

      {/* 2. کانتینر عکس (Hero Image)
          سایز به گونه‌ای تنظیم شده که در موبایل و دسکتاپ عالی باشد.
          افکت hover:scale-105 باعث می‌شود وقتی موس روی عکس رفت، خیلی نرم زوم شود.
      */}
      <div className="relative z-10 w-full max-w-[500px] md:max-w-[800px] aspect-square sm:aspect-[4/3] animate-in fade-in zoom-in duration-1000 ease-out">
        <Image
          src="/hero-mockup.png" // 👈 عکس شما اینجا لود می‌شود
          alt="UniCase New Collection"
          fill
          className="object-contain transition-transform duration-1000 ease-in-out hover:scale-105"
          priority
        />
      </div>

      {/* 3. دکمه شناور (Minimal CTA)
          این دکمه کمی روی پایین عکس قرار می‌گیرد (Negative Margin) تا پیوستگی ایجاد شود.
          استایل شیشه‌ای (Backdrop Blur) دارد.
      */}
      <div className="z-20 mt-[-50px] sm:mt-[-80px] animate-in slide-in-from-bottom-8 fade-in duration-1000 delay-300">
        <Button
          asChild
          size="lg"
          className="h-14 rounded-full bg-white/80 backdrop-blur-xl text-gray-900 border border-white/50 hover:bg-white shadow-2xl shadow-gray-200/50 px-10 text-lg font-bold transition-all hover:-translate-y-1 hover:shadow-3xl"
        >
          <Link href="/products">
            مشاهده و خرید
            <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
