"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { redirect } from "next/navigation";

const prisma = new PrismaClient();

// 1. تعریف قوانین اعتبارسنجی
const LoginFormSchema = z.object({
  phoneNumber: z.string().min(11, "شماره موبایل باید ۱۱ رقم باشد"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

export async function loginAction(prevState: any, formData: FormData) {
  // 2. دریافت و چک کردن اطلاعات
  const rawData = {
    phoneNumber: formData.get("phoneNumber"),
    password: formData.get("password"),
  };

  const validatedFields = LoginFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: "فرمت اطلاعات اشتباه است",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { phoneNumber, password } = validatedFields.data;

  try {
    // 3. پیدا کردن کاربر در دیتابیس
    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      return { message: "کاربری با این شماره یافت نشد" };
    }

    // نکته امنیتی: بعداً اینجا باید از bcrypt برای مقایسه هش استفاده کنیم.
    // فعلاً چون در seed پسورد ساده گذاشتیم، مستقیم چک می‌کنیم.
    if (user.password !== password) {
      return { message: "رمز عبور اشتباه است" };
    }

    // 4. موفقیت! (اینجا بعداً کوکی ست می‌کنیم)
    console.log("Login Successful:", user.phoneNumber);
  } catch (error) {
    return { message: "خطای سرور رخ داد" };
  }

  // ریدایرکت باید خارج از بلوک try/catch باشد
  redirect("/dashboard");
}
