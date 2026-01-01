import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";
import { UserStatus } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "USER" | "SUPPORT";
      phoneNumber: string;
      status: UserStatus;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    role: "ADMIN" | "USER" | "SUPPORT";
    phoneNumber: string;
    status: UserStatus;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "USER" | "SUPPORT";
    phoneNumber: string;
    status: UserStatus;
  }
}
