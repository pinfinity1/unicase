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
      // نام فیلدها برای فرم لاگین
      credentials: {
        phoneNumber: { label: "شماره موبایل", type: "text" },
        password: { label: "رمز عبور", type: "password" },
      },
      // منطق بررسی یوزر و پسورد
      authorize: async (credentials) => {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { phoneNumber, password } = validatedFields.data;

          // ۱. پیدا کردن کاربر از دیتابیس
          const user = await db.user.findUnique({
            where: { phoneNumber },
          });

          // اگر کاربر نبود یا پسورد نداشت
          if (!user || !user.password) return null;

          // ۲. مقایسه پسورد وارد شده با پسورد هش شده در دیتابیس
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
    // اضافه کردن نقش (Role) و ID به سشن کاربر
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        // @ts-ignore
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        // @ts-ignore
        token.role = user.role;
      }
      return token;
    },
  },
});
