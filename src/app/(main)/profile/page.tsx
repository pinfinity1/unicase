// src/app/(shop)/profile/page.tsx
import { auth } from "@/auth";
import ProfileForm from "@/components/profile/profile-form";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-heavy">تنظیمات حساب</h1>
      {/* پاس دادن دیتا از سرور به کلاینت */}
      <ProfileForm
        initialName={user?.name || ""}
        phoneNumber={user?.phoneNumber || ""}
      />
    </div>
  );
}
