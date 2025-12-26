// src/auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;

      const isOnAdminPanel = nextUrl.pathname.startsWith("/admin");
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");

      // ۱. محافظت از پنل ادمین
      if (isOnAdminPanel) {
        if (!isLoggedIn) return false; // هدایت خودکار به لاگین
        if (userRole !== "ADMIN")
          return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // ۲. جلوگیری از دسترسی مجدد به لاگین برای کاربران لاگین شده
      if (isOnLoginPage && isLoggedIn) {
        const destination = userRole === "ADMIN" ? "/admin" : "/";
        return Response.redirect(new URL(destination, nextUrl));
      }

      return true;
    },

    // انتقال تمام داده‌ها به توکن (برای دسترسی در Middleware و Client)
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phoneNumber = token.phoneNumber;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
