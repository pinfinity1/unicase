// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");
  const adminPhone = "09397155826";
  const passwordRaw = "admin123456";

  // ۱. حذف کاربر قدیمی (اگر وجود دارد)
  // این کار باعث می‌شود مطمئن شویم دیتای قدیمی و خراب باقی نمی‌ماند
  const existingUser = await prisma.user.findUnique({
    where: { phoneNumber: adminPhone },
  });

  if (existingUser) {
    await prisma.user.delete({
      where: { phoneNumber: adminPhone },
    });
    console.log("🗑️ Old admin deleted.");
  }

  // ۲. ساخت مجدد با هش صحیح
  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  const admin = await prisma.user.create({
    data: {
      phoneNumber: adminPhone,
      name: "مدیر اصلی",
      role: Role.ADMIN,
      password: hashedPassword,
    },
  });

  console.log(`✅ Admin created with hashed password.`);
  console.log(`📱 User: ${admin.phoneNumber}`);
  console.log(`🔑 Pass: ${passwordRaw}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
