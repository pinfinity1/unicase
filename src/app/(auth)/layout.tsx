import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-200 via-white to-gray-100 px-4 py-12 text-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-[380px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* بخش مشترک: لوگو (وسط‌چین و موبایل‌فرست) */}
        <div className="flex flex-col items-center text-center">
          <Link href={"/"} className="relative h-20 w-20 mb-4">
            <Image
              src="/logo/unicase-black.png"
              alt="UniCase Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* محتوای متغیر صفحات (Login یا Register) در اینجا رندر می‌شود */}
          {children}
        </div>

        {/* فوتر مشترک */}
        <div className="mt-8 pt-6 text-center">
          <p className="text-xs text-gray-400 font-medium">
            © ۲۰۲۵ UniCase. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
