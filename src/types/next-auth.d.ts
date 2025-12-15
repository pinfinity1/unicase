// مسیر: src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

// گسترش تایپ‌های پیش‌فرض Session
declare module "next-auth" {
  interface Session {
    user: {
      role: "ADMIN" | "USER";
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "ADMIN" | "USER";
  }
}

// گسترش تایپ‌های JWT (چون اطلاعات اول میره تو توکن)
declare module "next-auth/jwt" {
  interface JWT {
    role: "ADMIN" | "USER";
    id: string;
  }
}
