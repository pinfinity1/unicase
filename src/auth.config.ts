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

      if (isOnAdminPanel) {
        if (!isLoggedIn) return false;
        if (userRole !== "ADMIN")
          return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (isOnLoginPage && isLoggedIn) {
        const destination = userRole === "ADMIN" ? "/admin" : "/";
        return Response.redirect(new URL(destination, nextUrl));
      }

      return true;
    },

    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as "ADMIN" | "USER";
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
