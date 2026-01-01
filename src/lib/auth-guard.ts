import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error("لطفاً ابتدا وارد حساب کاربری شوید.");
  }

  if (session.user.status === "BANNED") {
    throw new Error("حساب کاربری شما مسدود شده است.");
  }

  if (session.user.status === "SUSPENDED") {
    throw new Error("حساب شما موقتاً محدود شده است.");
  }

  if (session.user.role !== "ADMIN") {
    throw new Error("دسترسی غیرمجاز! شما مدیر سیستم نیستید.");
  }

  return session.user;
}

export async function requireStaff() {
  const session = await auth();

  if (!session?.user) throw new Error("لطفاً وارد شوید.");

  if (session.user.status !== "ACTIVE") {
    throw new Error("حساب شما فعال نیست.");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT") {
    throw new Error("دسترسی غیرمجاز.");
  }

  return session.user;
}
