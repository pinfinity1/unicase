import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { MobileSidebar } from "@/components/admin/mobile-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <aside className="fixed inset-y-4 right-4 z-20 hidden w-64 md:block">
        <AdminSidebar />
      </aside>

      <div className="flex flex-1 flex-col md:mr-72 transition-all duration-300">
        <div className="sticky top-0 z-10 md:hidden p-4">
          <MobileSidebar />
        </div>

        <main className="flex-1 p-4 md:py-4 md:pl-4">{children}</main>
      </div>
    </div>
  );
}
