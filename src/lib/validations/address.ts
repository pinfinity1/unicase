import { z } from "zod";

export const addressSchema = z.object({
  title: z.string().min(2, { message: "عنوان آدرس باید حداقل ۲ حرف باشد" }),
  recipientName: z.string().min(3, { message: "نام گیرنده باید کامل باشد" }),
  recipientPhone: z
    .string()
    .length(11, { message: "شماره تماس باید ۱۱ رقم باشد" })
    .regex(/^09[0-9]{9}$/, { message: "فرمت شماره موبایل صحیح نیست" }),
  province: z.string().min(2, { message: "استان را انتخاب کنید" }),
  city: z.string().min(2, { message: "شهر را انتخاب کنید" }),
  fullAddress: z.string().min(10, { message: "آدرس پستی باید دقیق باشد" }),
  postalCode: z
    .string()
    .length(10, { message: "کد پستی باید ۱۰ رقم باشد" })
    .regex(/^[0-9]+$/, { message: "کد پستی فقط باید شامل اعداد باشد" }),
});

export type AddressFormData = z.infer<typeof addressSchema>;
