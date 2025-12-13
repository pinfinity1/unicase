// prisma/seed.ts
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding essential data...");

  // شماره موبایل ادمین (یک شماره پیش‌فرض برای خودت)
  const adminPhone = "09397155826";

  const admin = await prisma.user.upsert({
    where: { phoneNumber: adminPhone },
    update: {},
    create: {
      phoneNumber: adminPhone,
      name: "مدیر اصلی",
      role: Role.ADMIN,
      // فعلاً یک پسورد ساده می‌گذاریم تا بدون نیاز به سامانه پیامک بتوانی وارد شوی
      password: "admin123456",
    },
  });

  console.log(`🛡️ Admin user ready: ${admin.phoneNumber}`);
  console.log("✅ Seeding finished.");
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
