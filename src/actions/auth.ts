"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { db } from "@/lib/db";
import { FormState } from "@/types";
import bcrypt from "bcryptjs";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { cookies, headers } from "next/headers";
import { cartService } from "@/services/cart-service";
import { checkRateLimit, generateSecureOtp } from "@/lib/security";
import { LoginSchema, RegisterSchema } from "@/lib/validations/auth";

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
    if (isRedirectError(error)) throw error;

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CallbackRouteError":
          return {
            success: false,
            message: (error.cause as any)?.message || "خطا در احراز هویت.",
          };

        case "CredentialsSignin":
          return {
            success: false,
            message: "اطلاعات ورود صحیح نیست.",
          };

        default:
          return {
            success: false,
            message: "خطایی در سیستم رخ داد.",
          };
      }
    }

    // ۳. خطاهای پیش‌بینی نشده
    console.error("Auth Action Error:", error);
    return { success: false, message: "خطای سرور رخ داد." };
  }
}

export async function registerAction(
  prevState: FormState | undefined,
  formData: FormData
): Promise<FormState | undefined> {
  const token = formData.get("token") as string;
  const rawPhoneNumber = formData.get("phoneNumber") as string;

  // گام ۱: پیدا کردن توکن فعال (بدون چک کردن خود کد توکن در شرط where)
  const activeVerification = await db.verificationToken.findFirst({
    where: {
      phoneNumber: rawPhoneNumber,
      expires: { gt: new Date() },
    },
  });

  if (!activeVerification) {
    return {
      success: false,
      message: "کد تایید منقضی شده یا وجود ندارد. لطفاً مجدد درخواست دهید.",
    };
  }

  // گام ۲: بررسی صحت کد
  if (activeVerification.token !== token) {
    const newAttempts = activeVerification.attempts + 1;

    // اگر ۳ بار اشتباه زد، کد را بسوزان
    if (newAttempts >= 3) {
      await db.verificationToken.delete({
        where: { id: activeVerification.id },
      });
      return {
        success: false,
        message: "تعداد تلاش‌های ناموفق بیش از حد مجاز بود. کد باطل شد.",
      };
    }

    // آپدیت تعداد تلاش‌ها
    await db.verificationToken.update({
      where: { id: activeVerification.id },
      data: { attempts: newAttempts },
    });

    return { success: false, message: "کد وارد شده صحیح نیست." };
  }

  // ادامه اعتبارسنجی فرم ثبت‌نام
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
        status: "ACTIVE", // وضعیت پیش‌فرض
      },
    });

    // حذف توکن پس از موفقیت
    await db.verificationToken.delete({ where: { id: activeVerification.id } });

    // انتقال سبد خرید مهمان (Logic Merge Cart)
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

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CallbackRouteError":
          return {
            success: false,
            message: (error.cause as any)?.message || "خطا در احراز هویت.",
          };

        case "CredentialsSignin":
          return {
            success: false,
            message: "اطلاعات ورود صحیح نیست.",
          };

        default:
          return {
            success: false,
            message: "خطایی در سیستم رخ داد.",
          };
      }
    }

    // ۳. خطاهای پیش‌بینی نشده
    console.error("Auth Action Error:", error);
    return { success: false, message: "خطای سرور رخ داد." };
  }
}

export async function sendOtpAction(phoneNumber: string) {
  const ip = (await headers()).get("x-forwarded-for") || "unknown";

  if (!checkRateLimit(`send_otp_${ip}`, 10, 3600)) {
    return {
      success: false,
      message:
        "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً ۱ ساعت دیگر تلاش کنید.",
    };
  }

  try {
    const user = await db.user.findUnique({
      where: { phoneNumber },
      select: { status: true },
    });

    if (user?.status === "BANNED") {
      return { success: false, message: "حساب کاربری شما مسدود است." };
    }

    const lastToken = await db.verificationToken.findFirst({
      where: { phoneNumber },
      orderBy: { expires: "desc" },
    });

    if (lastToken) {
      const now = new Date();
      const diffInSeconds = Math.floor(
        (lastToken.expires.getTime() - now.getTime()) / 1000
      );

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
        data: {
          phoneNumber,
          token: otp,
          expires,
          attempts: 0,
        },
      }),
    ]);

    if (process.env.NODE_ENV === "development") {
      console.log(`[SECURE AUTH] OTP for ${phoneNumber}: ${otp}`);
    }

    // اینجا باید سرویس پیامک واقعی فراخوانی شود
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
    const activeVerification = await db.verificationToken.findFirst({
      where: {
        phoneNumber,
        expires: { gt: new Date() },
      },
    });

    if (!activeVerification) {
      return { success: false, message: "کد تایید منقضی شده یا وجود ندارد." };
    }

    if (activeVerification.token !== token) {
      const newAttempts = activeVerification.attempts + 1;

      if (newAttempts >= 3) {
        await db.verificationToken.delete({
          where: { id: activeVerification.id },
        });
        return {
          success: false,
          message: "تعداد تلاش‌های ناموفق بیش از حد مجاز بود. کد باطل شد.",
        };
      }

      await db.verificationToken.update({
        where: { id: activeVerification.id },
        data: { attempts: newAttempts },
      });

      return { success: false, message: "کد وارد شده صحیح نیست." };
    }

    await db.verificationToken.delete({ where: { id: activeVerification.id } });

    const user = await db.user.findUnique({
      where: { phoneNumber },
      select: { id: true, status: true },
    });

    if (user) {
      if (user.status === "BANNED")
        return { success: false, message: "حساب مسدود است." };

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

    if (error instanceof AuthError) {
      switch (error.type) {
        case "CallbackRouteError":
          return {
            success: false,
            message: (error.cause as any)?.message || "خطا در احراز هویت.",
          };

        case "CredentialsSignin":
          return {
            success: false,
            message: "اطلاعات ورود صحیح نیست.",
          };

        default:
          return {
            success: false,
            message: "خطایی در سیستم رخ داد.",
          };
      }
    }

    console.error("Auth Action Error:", error);
    return { success: false, message: "خطای سرور رخ داد." };
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}
