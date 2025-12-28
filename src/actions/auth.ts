"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { FormState } from "@/types";
import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies } from "next/headers";
import { cartService } from "@/services/cart-service";

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

// --- Actions ---

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
      select: { id: true, role: true },
    });

    if (user) {
      if (user.role === "ADMIN") destination = "/admin";

      // 🔥 MERGE LOGIC
      const cookieStore = await cookies();
      const guestCartId = cookieStore.get("cartId")?.value;

      if (guestCartId) {
        try {
          await cartService.mergeCarts(user.id, guestCartId);
          cookieStore.delete("cartId"); // پاکسازی کوکی
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

    // 🔥 MERGE LOGIC
    const cookieStore = await cookies();
    const guestCartId = cookieStore.get("cartId")?.value;

    if (guestCartId) {
      try {
        await cartService.mergeCarts(newUser.id, guestCartId);
        cookieStore.delete("cartId"); // پاکسازی کوکی
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

      if (diffInSeconds > 30) {
        return {
          success: false,
          message: `لطفاً ${diffInSeconds - 30} ثانیه دیگر مجدداً تلاش کنید.`,
        };
      }
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 2 * 60 * 1000);

    await db.$transaction([
      db.verificationToken.deleteMany({ where: { phoneNumber } }),
      db.verificationToken.create({
        data: { phoneNumber, token: otp, expires },
      }),
    ]);

    console.log(`[AUTH] کد تایید ۲ دقیقه‌ای برای ${phoneNumber}: ${otp}`);

    return { success: true };
  } catch (error) {
    console.error("OTP Error:", error);
    return { success: false, message: "خطا در ارسال پیامک" };
  }
}

// ✅ اصلاح شده: ورود با OTP (لینک مستقیم یا جایگزین رمز)
export async function loginWithOtpAction(phoneNumber: string, token: string) {
  try {
    const verifiedToken = await db.verificationToken.findFirst({
      where: { phoneNumber, token, expires: { gt: new Date() } },
    });

    if (!verifiedToken)
      return { success: false, message: "کد نامعتبر یا منقضی شده است" };

    await db.verificationToken.delete({ where: { id: verifiedToken.id } });

    // 🔥 MERGE LOGIC START
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
          cookieStore.delete("cartId"); // پاکسازی کوکی
        } catch (e) {
          console.error("Cart Merge Error (LoginWithOtp):", e);
        }
      }
    }
    // 🔥 MERGE LOGIC END

    await signIn("credentials", {
      phoneNumber,
      isOtpLogin: "true",
      redirectTo: "/",
    });

    // این خط احتمالاً هرگز اجرا نمیشه چون signIn ریدایرکت میکنه، ولی برای تایپ‌اسکریپت:
    return { success: true, message: "ورود موفق" };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: "خطایی رخ داد" };
  }
}

// ✅ اصلاح شده: ورود با OTP (فرم)
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

    // 🔥 MERGE LOGIC START
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
          cookieStore.delete("cartId"); // پاکسازی کوکی
        } catch (e) {
          console.error("Cart Merge Error (VerifyOtp):", e);
        }
      }
    }
    // 🔥 MERGE LOGIC END

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
