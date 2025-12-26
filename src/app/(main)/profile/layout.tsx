import { Sidebar } from "@/components/profile/Sidebar";
import Image from "next/image";

// src/app/(main)/profile/layout.tsx
export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans">
      {/* پس‌زمینه پویا */}
      <div className="fixed inset-0 -z-20">
        <Image
          src="/profile-mesh.webp" // تصویر انتزاعی یا منظره با کنتراست بالا
          className="h-full w-full object-cover"
          alt="Refraction Background"
          fill
          priority
        />
      </div>

      {/* کانتینر اصلی: در موبایل پدینگ کمتر می‌شود */}
      <div className="container mx-auto px-4 py-10 lg:py-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          {/* سایدبار: در موبایل به بالای محتوا می‌رود و افقی می‌شود */}
          <aside className="w-full lg:w-80 lg:sticky lg:top-32 shrink-0">
            <div className="rounded-[28px] lg:rounded-[35px] border border-white/40 bg-white/30 p-2 lg:p-3 backdrop-blur-xl shadow-lg">
              <Sidebar />
            </div>
          </aside>

          {/* کانتینر محتوا: در موبایل گوشه‌ها گردی کمتری دارند (rounded-3xl) */}
          <main className="flex-1 w-full min-w-0">
            <div className="min-h-[60vh] lg:min-h-[75vh] rounded-[32px] lg:rounded-[45px] border border-white/50 bg-white/40 p-6 md:p-10 lg:p-14 backdrop-blur-2xl shadow-xl relative overflow-hidden">
              <div className="relative z-10">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
