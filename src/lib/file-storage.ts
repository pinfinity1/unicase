import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export async function saveFile(file: File): Promise<string> {
  const uploadsDir = path.join(process.cwd(), "public", "uploads");

  // اطمینان از وجود پوشه uploads
  try {
    await fs.access(uploadsDir);
  } catch {
    await fs.mkdir(uploadsDir, { recursive: true });
  }

  // تولید نام فایل یکتا (برای جلوگیری از تداخل نام‌ها)
  const buffer = Buffer.from(await file.arrayBuffer());
  const hash = crypto.randomBytes(8).toString("hex");
  const ext = path.extname(file.name);
  const fileName = `${hash}-${Date.now()}${ext}`;
  const filePath = path.join(uploadsDir, fileName);

  // نوشتن فایل روی دیسک
  await fs.writeFile(filePath, buffer);

  // برگرداندن مسیر نسبی برای ذخیره در دیتابیس
  return `/uploads/${fileName}`;
}

export async function deleteFile(filePath: string) {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
}
