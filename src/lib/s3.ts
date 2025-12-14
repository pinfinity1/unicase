import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

// تنظیمات کلاینت (یک بار برای همیشه)
const s3Client = new S3Client({
  region: process.env.S3_REGION!,
  endpoint: process.env.S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  forcePathStyle: true, // این خط برای MinIO حیاتی است
});

/**
 * آپلود فایل با مدیریت پوشه‌بندی و نام‌گذاری یکتا
 * @param file فایل دریافتی از فرم
 * @param folder نام پوشه (مثلاً products) برای نظم‌دهی
 */
export async function uploadImage(
  file: File,
  folder: string = "products"
): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // نام‌گذاری هوشمند: timestamp + نام اصلی (فاصله‌ها با خط تیره عوض می‌شوند)
  // نتیجه: products/17098234-my-image.jpg
  const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

  const params = {
    Bucket: process.env.S3_BUCKET_NAME!,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
    // ACL: 'public-read', // اگر باکت Public نباشد، این لازم است
  };

  await s3Client.send(new PutObjectCommand(params));

  // بازگرداندن لینک کامل برای ذخیره در دیتابیس
  return `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${fileName}`;
}

/**
 * حذف فایل از استوریج (برای جلوگیری از فایل‌های یتیم)
 * @param imageUrl لینک کامل عکس
 */
export async function deleteImage(imageUrl: string) {
  try {
    if (!imageUrl) return;

    // استخراج "Key" از URL
    // مثال: http://localhost:9000/unicase-media/products/abc.jpg
    // ما فقط نیاز داریم به: products/abc.jpg
    const bucketUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/`;

    if (imageUrl.startsWith(bucketUrl)) {
      const imageKey = imageUrl.replace(bucketUrl, "");

      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: imageKey,
        })
      );
      console.log(`🗑️ Image deleted from S3: ${imageKey}`);
    }
  } catch (error) {
    console.error("❌ Error deleting image from S3:", error);
    // اینجا ارور را throw نمی‌کنیم تا پروسه حذف محصول متوقف نشود
    // ولی لاگ می‌گیریم تا دستی بررسی کنیم
  }
}
