"use server";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { FormState } from "@/types";
import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";

const LoginSchema = z.object({
  phoneNumber: z.string().min(11, "شماره موبایل باید ۱۱ رقم باشد"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

const RegisterSchema = z
  .object({
    phoneNumber: z.string().min(11, "شماره موبایل باید ۱۱ رقم باشد"),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    confirmPassword: z.string().min(6, "تایید رمز عبور الزامی است"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تایید آن مطابقت ندارند",
    path: ["confirmPassword"],
  });

export async function checkUserAction(
  phoneNumber: string
): Promise<{ exists: boolean; error?: string }> {
  try {
    const user = await db.user.findUnique({
      where: { phoneNumber },
      select: { id: true },
    });
    return { exists: !!user };
  } catch (error) {
    return { exists: false, error: "خطا در برقراری ارتباط با دیتابیس" };
  }
}

export async function loginAction(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState | undefined> {
  const rawData = {
    phoneNumber: formData.get("phoneNumber"),
    password: formData.get("password"),
  };

  const validatedFields = LoginSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: "فرمت اطلاعات اشتباه است",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { phoneNumber, password } = validatedFields.data;
  let destination = "/";

  try {
    const user = await db.user.findUnique({
      where: { phoneNumber },
      select: { role: true },
    });

    if (user && user.role === "ADMIN") {
      destination = "/admin";
    }

    await signIn("credentials", {
      phoneNumber,
      password,
      redirectTo: destination,
    });
    return { success: true, message: "ورود موفقیت‌آمیز" };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return {
            success: false,
            message: "شماره موبایل یا رمز عبور اشتباه است.",
          };
        default:
          return { success: false, message: "خطایی رخ داد." };
      }
    }
    throw error;
  }
}

export async function registerAction(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState | undefined> {
  // ۱. استخراج داده‌های خام برای تایید اولیه توکن
  const token = formData.get("token") as string;
  const rawPhoneNumber = formData.get("phoneNumber") as string; // تغییر نام برای جلوگیری از تداخل

  // ۲. تایید توکن قبل از هر عملیاتی
  const verifiedToken = await db.verificationToken.findFirst({
    where: {
      phoneNumber: rawPhoneNumber,
      token,
      expires: { gt: new Date() },
    },
  });

  if (!verifiedToken) {
    return { success: false, message: "کد تایید اشتباه یا منقضی است" };
  }

  // ۳. اعتبارسنجی فیلدها با Zod
  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  );

  if (!validatedFields.success) {
    return {
      success: false,
      message: "لطفاً خطاهای زیر را اصلاح کنید",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // حالا تعریف phoneNumber بدون تداخل انجام می‌شود
  const { phoneNumber, password } = validatedFields.data;

  try {
    const existingUser = await db.user.findUnique({ where: { phoneNumber } });
    if (existingUser) {
      return { success: false, message: "این شماره موبایل قبلاً ثبت شده است" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        phoneNumber,
        password: hashedPassword,
        role: "USER",
      },
    });

    // حذف توکن بعد از موفقیت عملیات برای امنیت بیشتر
    await db.verificationToken.delete({ where: { id: verifiedToken.id } });

    await signIn("credentials", {
      phoneNumber,
      password,
      redirectTo: "/",
    });

    return { success: true, message: "ثبت‌نام با موفقیت انجام شد" };
  } catch (error) {
    if (isRedirectError(error)) throw error;

    return {
      success: false,
      message: error instanceof AuthError ? "خطا در ورود خودکار" : "خطای سرور",
    };
  }
}

export async function sendOtpAction(phoneNumber: string) {
  try {
    // ۱. بررسی Rate Limit (جلوگیری از ارسال رگباری کد)
    const lastToken = await db.verificationToken.findFirst({
      where: { phoneNumber },
      orderBy: { expires: "desc" }, // بررسی آخرین توکن صادر شده
    });

    if (lastToken) {
      const now = new Date();
      // محاسبه ثانیه‌های باقی‌مانده تا انقضا (با فرض اعتبار ۲ دقیقه‌ای)
      const diffInSeconds = Math.floor(
        (lastToken.expires.getTime() - now.getTime()) / 1000
      );

      // اگر بیش از ۳۰ ثانیه از اعتبار کد قبلی مانده باشد، اجازه ارسال جدید نمی‌دهیم
      // (یعنی کاربر باید حداقل ۹۰ ثانیه صبر کند)
      if (diffInSeconds > 30) {
        return {
          success: false,
          message: `لطفاً ${diffInSeconds - 30} ثانیه دیگر مجدداً تلاش کنید.`,
        };
      }
    }

    // ۲. تولید کد جدید و تنظیم زمان انقضا روی ۲ دقیقه
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 2 * 60 * 1000); // دقیقاً ۲ دقیقه اعتبار

    // ۳. استفاده از تراکنش برای پاکسازی کدهای قبلی و ثبت کد جدید
    await db.$transaction([
      db.verificationToken.deleteMany({ where: { phoneNumber } }), // حذف تمام توکن‌های قبلی این شماره
      db.verificationToken.create({
        data: { phoneNumber, token: otp, expires },
      }),
    ]);

    // نمایش در ترمینال برای مرحله توسعه
    console.log(`[AUTH] کد تایید ۲ دقیقه‌ای برای ${phoneNumber}: ${otp}`);

    return { success: true };
  } catch (error) {
    console.error("OTP Error:", error);
    return { success: false, message: "خطا در ارسال پیامک" };
  }
}

// ورود با OTP (جایگزین فراموشی رمز)
export async function loginWithOtpAction(phoneNumber: string, token: string) {
  try {
    const verifiedToken = await db.verificationToken.findFirst({
      where: { phoneNumber, token, expires: { gt: new Date() } },
    });

    if (!verifiedToken)
      return { success: false, message: "کد نامعتبر یا منقضی شده است" };

    await db.verificationToken.delete({ where: { id: verifiedToken.id } });

    // ورود مستقیم بدون نیاز به پسورد
    await signIn("credentials", {
      phoneNumber,
      isOtpLogin: "true",
      redirectTo: "/",
    });
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: "خطایی رخ داد" };
  }
}

export async function verifyOtpAction(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState | undefined> {
  const phoneNumber = formData.get("phoneNumber") as string;
  const token = formData.get("token") as string;

  try {
    // ۱. جستجوی توکن در دیتابیس و چک کردن انقضا
    const verifiedToken = await db.verificationToken.findFirst({
      where: {
        phoneNumber,
        token,
        expires: { gt: new Date() }, // چک کردن زمان انقضا
      },
    });

    if (!verifiedToken) {
      return { success: false, message: "کد تایید اشتباه است یا منقضی شده." };
    }

    // ۲. پاک کردن توکن استفاده شده برای امنیت بیشتر
    await db.verificationToken.delete({ where: { id: verifiedToken.id } });

    // ۳. ورود کاربر به سیستم (Login)
    await signIn("credentials", {
      phoneNumber,
      isOtpLogin: "true", // سیگنال به Auth.js که ورود با OTP است
      redirectTo: "/",
    });

    return { success: true, message: "خوش آمدید!" };
  } catch (error) {
    if (isRedirectError(error)) throw error; // اجازه به Next.js برای ریدایرکت
    return { success: false, message: "خطایی در تایید کد رخ داد." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
