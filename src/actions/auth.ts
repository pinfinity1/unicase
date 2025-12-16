"use server";
import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { z } from "zod";
import { db } from "@/lib/db";
import { FormState } from "@/types";

const LoginSchema = z.object({
  phoneNumber: z.string().min(11, "شماره موبایل باید ۱۱ رقم باشد"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

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

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
