"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { FormState } from "@/types";
import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies, headers } from "next/headers";
import { cartService } from "@/services/cart-service";
import { checkRateLimit, generateSecureOtp } from "@/lib/security";

const LoginSchema = z.object({
  phoneNumber: z.string().min(11, "شماره موبایل باید ۱۱ رقم باشد"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

const RegisterSchema = z
  .object({
    phoneNumber: z.string().min(11),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تایید آن مطابقت ندارند",
    path: ["confirmPassword"],
  });

export async function checkUserAction(
  phoneNumber: string
): Promise<{ exists: boolean; error?: string }> {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";

  if (!checkRateLimit(`check_user_${ip}`, 10, 60)) {
    return {
      exists: false,
      error: "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً کمی صبر کنید.",
    };
  }

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
  // ... همان کد قبلی ...
  // فقط برای خلاصه شدن اینجا نیاوردم، کد شما در فایل اصلی صحیح بود
  // تنها نکته: اگر بخواهید روی لاگین هم Rate Limit بگذارید، مشابه checkUserAction عمل کنید.

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
      select: { id: true, role: true },
    });

    if (user) {
      if (user.role === "ADMIN") destination = "/admin";

      const cookieStore = await cookies();
      const guestCartId = cookieStore.get("cartId")?.value;

      if (guestCartId) {
        try {
          await cartService.mergeCarts(user.id, guestCartId);
          cookieStore.delete("cartId");
        } catch (mergeError) {
          console.error("Cart Merge Error (Login):", mergeError);
        }
      }
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
  const token = formData.get("token") as string;
  const rawPhoneNumber = formData.get("phoneNumber") as string;

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

  const { phoneNumber, password } = validatedFields.data;

  try {
    const existingUser = await db.user.findUnique({ where: { phoneNumber } });
    if (existingUser) {
      return { success: false, message: "این شماره موبایل قبلاً ثبت شده است" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        phoneNumber,
        password: hashedPassword,
        role: "USER",
      },
    });

    await db.verificationToken.delete({ where: { id: verifiedToken.id } });

    const cookieStore = await cookies();
    const guestCartId = cookieStore.get("cartId")?.value;

    if (guestCartId) {
      try {
        await cartService.mergeCarts(newUser.id, guestCartId);
        cookieStore.delete("cartId");
      } catch (e) {
        console.error("Cart Merge Error (Register):", e);
      }
    }

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
  const ip = (await headers()).get("x-forwarded-for") || "unknown";

  if (!checkRateLimit(`send_otp_${ip}`, 3, 120)) {
    return {
      success: false,
      message: "تعداد درخواست‌های OTP شما زیاد است. لطفاً ۲ دقیقه صبر کنید.",
    };
  }

  try {
    const lastToken = await db.verificationToken.findFirst({
      where: { phoneNumber },
      orderBy: { expires: "desc" },
    });

    if (lastToken) {
      const now = new Date();
      const diffInSeconds = Math.floor(
        (lastToken.expires.getTime() - now.getTime()) / 1000
      );

      const timeSinceCreation = 120 - diffInSeconds;

      if (diffInSeconds > 60) {
        return {
          success: false,
          message: `لطفاً ${diffInSeconds - 60} ثانیه دیگر مجدداً تلاش کنید.`,
        };
      }
    }

    const otp = generateSecureOtp();
    const expires = new Date(Date.now() + 2 * 60 * 1000);

    await db.$transaction([
      db.verificationToken.deleteMany({ where: { phoneNumber } }),
      db.verificationToken.create({
        data: { phoneNumber, token: otp, expires },
      }),
    ]);

    if (process.env.NODE_ENV === "development") {
      console.log(`[SECURE AUTH] OTP for ${phoneNumber}: ${otp}`);
    }

    return { success: true };
  } catch (error) {
    console.error("OTP Error:", error);
    return { success: false, message: "خطا در ارسال پیامک" };
  }
}

export async function loginWithOtpAction(phoneNumber: string, token: string) {
  try {
    const verifiedToken = await db.verificationToken.findFirst({
      where: { phoneNumber, token, expires: { gt: new Date() } },
    });

    if (!verifiedToken)
      return { success: false, message: "کد نامعتبر یا منقضی شده است" };

    await db.verificationToken.delete({ where: { id: verifiedToken.id } });

    const user = await db.user.findUnique({
      where: { phoneNumber },
      select: { id: true },
    });

    if (user) {
      const cookieStore = await cookies();
      const guestCartId = cookieStore.get("cartId")?.value;

      if (guestCartId) {
        try {
          await cartService.mergeCarts(user.id, guestCartId);
          cookieStore.delete("cartId");
        } catch (e) {
          console.error("Cart Merge Error (LoginWithOtp):", e);
        }
      }
    }

    await signIn("credentials", {
      phoneNumber,
      isOtpLogin: "true",
      redirectTo: "/",
    });

    return { success: true, message: "ورود موفق" };
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
    const verifiedToken = await db.verificationToken.findFirst({
      where: {
        phoneNumber,
        token,
        expires: { gt: new Date() },
      },
    });

    if (!verifiedToken) {
      return { success: false, message: "کد تایید اشتباه است یا منقضی شده." };
    }

    await db.verificationToken.delete({ where: { id: verifiedToken.id } });

    const user = await db.user.findUnique({
      where: { phoneNumber },
      select: { id: true },
    });

    if (user) {
      const cookieStore = await cookies();
      const guestCartId = cookieStore.get("cartId")?.value;

      if (guestCartId) {
        try {
          await cartService.mergeCarts(user.id, guestCartId);
          cookieStore.delete("cartId");
        } catch (e) {
          console.error("Cart Merge Error (VerifyOtp):", e);
        }
      }
    }

    await signIn("credentials", {
      phoneNumber,
      isOtpLogin: "true",
      redirectTo: "/",
    });

    return { success: true, message: "خوش آمدید!" };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: "خطایی در تایید کد رخ داد." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
