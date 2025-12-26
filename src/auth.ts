// مسیر فایل: ./auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// تعریف قوانین اعتبارسنجی ورودی
const LoginSchema = z.object({
  phoneNumber: z.string().min(11),
  password: z.string().min(6),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials) => {
        // ۱. دریافت پارامترهای ارسالی از اکشن‌ها
        const { phoneNumber, password, isOtpLogin } = credentials;

        // ۲. سناریوی ورود با کد یکبار مصرف (OTP)
        if (isOtpLogin === "true") {
          const user = await db.user.findUnique({
            where: { phoneNumber: phoneNumber as string },
          });

          if (!user) return null;

          // در ورود با OTP، اگر کاربر وجود داشت، تایید می‌شود
          return user;
        }

        // ۳. سناریوی ورود با رمز عبور (منطق قبلی شما)
        const validatedFields = LoginSchema.safeParse({
          phoneNumber,
          password,
        });

        if (validatedFields.success) {
          const { phoneNumber, password } = validatedFields.data;
          const user = await db.user.findUnique({ where: { phoneNumber } });

          if (!user || !user.password) return null;

          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) return user;
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login", // آدرس صفحه لاگین اختصاصی شما
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phoneNumber = token.phoneNumber;
      }
      return session;
    },
  },
});
