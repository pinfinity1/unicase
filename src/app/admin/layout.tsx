import { AdminSidebar } from "@/components/admin/sidebar";
import { MobileSidebar } from "@/components/admin/mobile-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-zinc-50/50">
      <aside className="fixed inset-y-0 right-0 z-20 hidden w-64 border-l bg-white md:block shadow-sm">
        <AdminSidebar />
      </aside>

      <div className="flex flex-1 flex-col md:mr-64 transition-all duration-300">
        <div className="sticky top-0 z-10 md:hidden">
          <MobileSidebar />
        </div>

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
