// src/lib/auth-utils.ts
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/login?callbackUrl=/admin");
  }
  return session;
}
