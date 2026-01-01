import { z } from "zod";

// Regex for Iranian Mobile Numbers (Example implementation for FR-01)
const PHONE_REGEX = /^09[0-9]{9}$/;

export const phoneSchema = z
  .string()
  .regex(PHONE_REGEX, "شماره موبایل معتبر نیست (مثال: 09123456789)");

export const passwordSchema = z
  .string()
  .min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد");

// UC-AUTH-01 & UC-AUTH-03
export const CheckUserSchema = z.object({
  phoneNumber: phoneSchema,
});

// UC-AUTH-02
export const LoginSchema = z.object({
  phoneNumber: phoneSchema,
  password: passwordSchema,
});

// UC-AUTH-03 (Registration)
export const RegisterSchema = z
  .object({
    phoneNumber: phoneSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    token: z.string().length(6, "کد تایید باید ۶ رقم باشد"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "رمز عبور و تایید آن مطابقت ندارند",
    path: ["confirmPassword"],
  });
