import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;
      const userStatus = auth?.user?.status;

      const isOnAdminPanel = nextUrl.pathname.startsWith("/admin");
      const isOnLoginPage = nextUrl.pathname.startsWith("/login");

      if (isLoggedIn && userStatus === "BANNED") {
        return false;
      }

      if (isOnAdminPanel) {
        if (!isLoggedIn) return false;

        if (userRole !== "ADMIN" && userRole !== "SUPPORT") {
          return Response.redirect(new URL("/", nextUrl));
        }
        return true;
      }

      if (isOnLoginPage && isLoggedIn) {
        const destination = userRole === "ADMIN" ? "/admin" : "/";
        return Response.redirect(new URL(destination, nextUrl));
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
        token.phoneNumber = user.phoneNumber;
        token.status = user.status;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.phoneNumber = token.phoneNumber;
        session.user.status = token.status;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
