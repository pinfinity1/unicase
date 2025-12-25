// app/(shop)/profile/layout.tsx
import { Sidebar } from "@/components/profile/Sidebar";
import Image from "next/image";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* لایه پس‌زمینه ثابت - iOS 26 Aesthetic */}
      <div className="fixed inset-0 -z-20">
        <Image
          src="/profile-mesh.webp" // تصویر انتزاعی یا منظره با کنتراست بالا
          className="h-full w-full object-cover"
          alt="Refraction Background"
          fill
          priority
        />
      </div>

      <div className="container mx-auto px-4 pt-28 pb-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* سایدبار با استایل Glass Prism */}
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-28 rounded-[32px] border bg-white border-white/10 p-2 shadow-2xl">
              <Sidebar />
            </div>
          </aside>

          {/* محتوای اصلی */}
          <main className="flex-1">
            <div className="min-h-[70vh] rounded-[40px] border border-white/10 bg-white p-6 md:p-12 shadow-2xl overflow-hidden relative">
              <div className="relative z-10">{children}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
