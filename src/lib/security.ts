// src/lib/security.ts
import { randomInt } from "crypto";

/**
 * 🔒 تولید کد ۶ رقمی با استاندارد رمزنگاری (Cryptographically Secure)
 * جایگزین امن برای Math.random
 */
export function generateSecureOtp(): string {
  // تولید عدد بین ۱۰۰۰۰۰ تا ۹۹۹۹۹۹
  return randomInt(100000, 1000000).toString();
}

/**
 * 🛡️ سیستم ساده Rate Limiter (In-Memory)
 * نکته: در محیط‌های Serverless (مثل Vercel) این حافظه با ریست شدن کانتینر پاک می‌شود.
 * برای پروداکشن واقعی با ترافیک بالا، استفاده از Redis (مثل Upstash) پیشنهاد می‌شود.
 */
const trackers = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowSeconds: number = 60
): boolean {
  const now = Date.now();
  const record = trackers.get(identifier);

  // اگر رکوردی نیست یا منقضی شده، ریست کن
  if (!record || now > record.expiresAt) {
    trackers.set(identifier, {
      count: 1,
      expiresAt: now + windowSeconds * 1000,
    });
    return true;
  }

  // اگر هنوز وقت دارد، تعداد را چک کن
  if (record.count >= limit) {
    return false; // محدودیت رد شد
  }

  // افزایش شمارنده
  record.count += 1;
  return true;
}
