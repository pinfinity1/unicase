import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import { LoginSchema } from "./lib/validations/auth";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: async (credentials) => {
        const { phoneNumber, password, isOtpLogin } = credentials;

        const user = await db.user.findUnique({
          where: { phoneNumber: phoneNumber as string },
        });

        if (user) {
          if (user.status === "BANNED") {
            throw new Error("حساب کاربری شما مسدود شده است.");
          }
          if (user.status === "SUSPENDED") {
            throw new Error(
              "حساب شما موقتاً غیرفعال است. با پشتیبانی تماس بگیرید."
            );
          }
        }

        if (isOtpLogin === "true") {
          if (!user) return null;
          return user;
        }

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
    signIn: "/login",
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
